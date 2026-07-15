import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validators/checkout";
import { getSessionUser } from "@/lib/auth";
import { sendOrderConfirmationEmail, sendOrderInvoiceEmail } from "@/lib/email";
import { scheduleEmail } from "@/lib/email-jobs";
import { resolveDiscount, markDiscountUsed } from "@/lib/discounts";
import { createPayadmitPayment } from "@/lib/payadmit";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    const body = await request.json();
    const validated = checkoutSchema.parse(body);
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!validated.contact.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems = items.map((item: { productId: string; quantity: number; variantName?: string }) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;

      return {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        variantName: item.variantName || null,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      };
    });

    const discount = await resolveDiscount({
      userId: user?.id ?? null,
      email: validated.contact.email,
      code: validated.discountCode ?? null,
    });

    const discountAmount = discount ? +(subtotal * (discount.percent / 100)).toFixed(2) : 0;
    const discountedSubtotal = subtotal - discountAmount;

    const taxRate = 21;
    const taxAmount = +(discountedSubtotal * (taxRate / 100)).toFixed(2);
    const shippingCost = discountedSubtotal >= 100 ? 0 : 5.99;
    const total = +(discountedSubtotal + taxAmount + shippingCost).toFixed(2);

    const order = await prisma.order.create({
      data: {
        userId: user?.id || null,
        customerName: `${validated.shipping.firstName} ${validated.shipping.lastName}`,
        customerEmail: validated.contact.email,
        customerPhone: validated.contact.phone,
        shippingAddress: validated.shipping,
        shippingMethod: validated.shippingMethod,
        shippingCost,
        subtotal,
        taxAmount,
        discountAmount,
        discountCode: discount?.code ?? null,
        discountPercent: discount?.percent ?? null,
        total,
        paymentMethod: "payadmit",
        items: { create: orderItems },
      },
      include: { items: true },
    });

    if (discount) {
      await markDiscountUsed(discount, user?.id ?? null);
    }

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    const userIp = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
                   request.headers.get("x-real-ip") ||
                   "127.0.0.1";
    const locale = body.locale || "en";
    const siteUrl = request.nextUrl.origin;

    let redirectUrl: string;
    let paymentId: string;

    try {
      const payadmitResult = await createPayadmitPayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        currency: "EUR",
        locale,
        userIp,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        shippingAddress: validated.shipping,
        userId: user?.id,
        siteUrl,
      });
      redirectUrl = payadmitResult.redirectUrl;
      paymentId = payadmitResult.paymentId;

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentId },
      });
    } catch (paymentError) {
      console.error("Payadmit payment creation failed:", paymentError);
      // Cancel the order and restore stock
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED", paymentStatus: "FAILED" },
      });
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      }
      return NextResponse.json({ error: "Failed to initialize payment gateway" }, { status: 500 });
    }

    return NextResponse.json({ ...order, redirectUrl }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
