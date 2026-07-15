import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayadmitSignature } from "@/lib/payadmit";
import { sendOrderConfirmationEmail, sendOrderInvoiceEmail } from "@/lib/email";
import { scheduleEmail } from "@/lib/email-jobs";

function extractOrderId(data: any): string {
  if (data.referenceId) return String(data.referenceId);
  if (data.externalId) {
    // externalId is formed as orderId_timestamp in our code
    const parts = String(data.externalId).split("_");
    return parts[0];
  }
  if (data.result?.referenceId) return String(data.result.referenceId);
  return "";
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get("Signature") || request.headers.get("signature") || "";

    console.log(`Received Payadmit webhook callback. Signature header: ${signatureHeader}`);

    const isVerified = verifyPayadmitSignature(rawBody, signatureHeader);
    if (!isVerified) {
      console.error("Payadmit callback verification failed: Signature mismatch.");
      return new Response("Unauthorized - Invalid Signature", { status: 401 });
    }

    let data: any;
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      console.error("Failed to parse Payadmit callback body:", e);
      return new Response("Invalid JSON payload", { status: 400 });
    }

    const orderId = extractOrderId(data);
    if (!orderId) {
      console.error("Could not extract order ID from callback payload:", rawBody);
      return new Response("Order ID not found in payload", { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      console.error(`Order with ID ${orderId} not found in database.`);
      return new Response("Order not found", { status: 404 });
    }

    const state = (
      data.state ||
      data.status ||
      data.result?.state ||
      ""
    ).toUpperCase();

    console.log(`Processing Payadmit state "${state}" for Order #${order.orderNumber}`);

    switch (state) {
      case "COMPLETED":
      case "SUCCESS":
      case "PAID":
        // Check if order is already paid to avoid double processing/emails
        if (order.paymentStatus !== "PAID") {
          const paymentId = data.id || data.paymentId || data.result?.id || order.paymentId;

          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "CONFIRMED",
              paymentStatus: "PAID",
              paymentId,
            },
          });

          // Schedule order confirmation and invoice emails
          const emailPayload = {
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            items: order.items,
            subtotal: order.subtotal,
            taxAmount: order.taxAmount,
            shippingCost: order.shippingCost,
            discountAmount: order.discountAmount,
            total: order.total,
            shippingMethod: order.shippingMethod || "standard",
            shippingAddress: order.shippingAddress as any,
            createdAt: order.createdAt,
          };

          scheduleEmail(`order confirmation ${order.orderNumber}`, () => sendOrderConfirmationEmail(emailPayload));
          scheduleEmail(`order invoice ${order.orderNumber}`, () => sendOrderInvoiceEmail(emailPayload));
          console.log(`Order #${order.orderNumber} successfully paid. Emails scheduled.`);
        }
        break;

      case "DECLINED":
      case "FAILED":
      case "REJECTED":
      case "CANCELLED":
      case "ERROR":
        if (order.status !== "CANCELLED" && order.paymentStatus !== "FAILED") {
          // Restore product inventory stock
          for (const item of order.items) {
            try {
              await prisma.product.update({
                where: { id: item.productId },
                data: { quantity: { increment: item.quantity } },
              });
            } catch (stockError) {
              console.error(`Failed to restore stock for product ${item.productId}:`, stockError);
            }
          }

          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "CANCELLED",
              paymentStatus: "FAILED",
            },
          });
          console.log(`Order #${order.orderNumber} marked as cancelled/failed. Stock restored.`);
        }
        break;

      case "REFUNDED":
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "REFUNDED",
            paymentStatus: "REFUNDED",
          },
        });
        console.log(`Order #${order.orderNumber} status updated to REFUNDED.`);
        break;

      case "PENDING":
      case "CHECKOUT":
      case "RECONCILIATION":
      case "AWAITING_WEBHOOK":
      case "AWAITING_REDIRECT":
      case "PARTIAL_COMPLETE":
      default:
        console.log(`Order #${order.orderNumber} is in pending/reconciliation state: ${state}. No status update needed.`);
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing Payadmit callback:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
