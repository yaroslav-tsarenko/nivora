import crypto from "crypto";

interface PayadmitCustomer {
  referenceId: string;
  citizenshipCountryCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  locale: string;
  ip: string;
}

interface PayadmitBillingAddress {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  countryCode: string;
  postalCode: string;
  state: string;
}

interface PayadmitPaymentPayload {
  paymentType: "DEPOSIT";
  paymentMethod: "BASIC_CARD";
  amount: number;
  currency: string;
  description: string;
  referenceId: string;
  externalId: string;
  customer: PayadmitCustomer;
  billingAddress: PayadmitBillingAddress;
  returnUrl: string;
  webhookUrl: string;
}

/**
 * Format phone number: No '+', space after country code, max 18 chars.
 * Matches the WooCommerce PHP implementation logic.
 */
export function getFormattedPhone(phone: string, countryCode: string): string {
  let cleaned = phone.trim();

  // Remove leading + or 00
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  }

  // Remove any other non-digit characters except spaces
  cleaned = cleaned.replace(/[^0-9 ]/g, "");

  let formatted = "";
  if (cleaned.includes(" ")) {
    const parts = cleaned.split(" ");
    const cc = parts[0].replace(/[^0-9]/g, "");
    const num = parts.slice(1).join("").replace(/[^0-9]/g, "");
    formatted = `${cc} ${num}`;
  } else {
    const callingCodes: Record<string, string> = {
      GB: "44", US: "1", CA: "1", RU: "7", UA: "380", PL: "48", DE: "49",
      FR: "33", IT: "39", ES: "34", BY: "375", KZ: "7", UZ: "998", GE: "995",
      AM: "374", LV: "371", LT: "370", EE: "372", FI: "358", SE: "46",
      NO: "47", DK: "45", NL: "31", BE: "32", AT: "43", CH: "41", PT: "351",
      CZ: "420", SK: "421", HU: "36", RO: "40", BG: "359", HR: "385",
      RS: "381", TR: "90", IL: "972", AE: "971", AU: "61", NZ: "64",
      CN: "86", JP: "81", KR: "82", IN: "91", BR: "55", MX: "52", ZA: "27",
    };

    const prefix = callingCodes[countryCode.toUpperCase()];
    if (prefix && cleaned.startsWith(prefix)) {
      formatted = `${prefix} ${cleaned.substring(prefix.length)}`;
    } else {
      if (prefix) {
        formatted = `${prefix} ${cleaned}`;
      } else if (cleaned.length > 8) {
        formatted = `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
      } else {
        formatted = cleaned;
      }
    }
  }

  return formatted.substring(0, 18);
}

/**
 * Verify HMAC SHA256 signature from Payadmit Webhook
 */
export function verifyPayadmitSignature(rawBody: string, signatureHeader: string): boolean {
  const signingKey = process.env.PAYADMIT_SIGNING_KEY;
  if (!signingKey) {
    console.warn("Payadmit Verification Warning: PAYADMIT_SIGNING_KEY is not defined. Skipping verification.");
    return true; // Bypass verification if signing key is not configured
  }

  if (!signatureHeader) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", signingKey)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(signatureHeader, "hex")
  );
}

interface PayadmitPaymentResponse {
  id?: string;
  paymentId?: string;
  redirectUrl?: string;
  url?: string;
  result?: {
    redirectUrl?: string;
    id?: string;
  };
  error?: string;
  message?: string;
  violations?: Array<{ field?: string; message?: string; error?: string }>;
  errors?: string[];
  status?: string;
}

/**
 * Create Payment Session on Payadmit API
 */
export async function createPayadmitPayment(args: {
  orderId: string;
  orderNumber: string;
  total: number;
  currency: string;
  locale: string;
  userIp: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string | null;
    city: string;
    province?: string | null;
    postalCode: string;
    country: string;
  };
  userId?: string | null;
  siteUrl?: string;
}): Promise<{ redirectUrl: string; paymentId: string }> {
  const apiToken = process.env.PAYADMIT_API_TOKEN;
  const baseUrl = (process.env.PAYADMIT_BASE_URL || "https://api.payadmit.com").replace(/\/$/, "");
  const siteUrl = (args.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://nivro.co.uk").replace(/\/$/, "");

  if (!apiToken) {
    throw new Error("Payadmit configuration error: PAYADMIT_API_TOKEN is missing");
  }

  const formattedPhone = args.customerPhone
    ? getFormattedPhone(args.customerPhone, args.shippingAddress.country)
    : undefined;

  const returnUrl = `${siteUrl}/${args.locale}/order/confirmed?orderId=${args.orderId}`;
  const webhookUrl = `${siteUrl}/api/payments/payadmit-callback`;

  const payload: PayadmitPaymentPayload = {
    paymentType: "DEPOSIT",
    paymentMethod: "BASIC_CARD",
    amount: args.total,
    currency: args.currency,
    description: `Order #${args.orderNumber}`,
    referenceId: args.orderId,
    externalId: `${args.orderId}_${Date.now()}`,
    customer: {
      referenceId: args.userId || `guest_${args.customerEmail}`,
      citizenshipCountryCode: args.shippingAddress.country,
      firstName: args.shippingAddress.firstName,
      lastName: args.shippingAddress.lastName,
      email: args.customerEmail,
      phone: formattedPhone,
      locale: args.locale.substring(0, 2).toLowerCase(),
      ip: args.userIp,
    },
    billingAddress: {
      addressLine1: args.shippingAddress.address1,
      addressLine2: args.shippingAddress.address2 || null,
      city: args.shippingAddress.city,
      countryCode: args.shippingAddress.country,
      postalCode: args.shippingAddress.postalCode,
      state: args.shippingAddress.province || "NA",
    },
    returnUrl,
    webhookUrl,
  };

  console.log(`Sending payment request to Payadmit URL: ${baseUrl}/api/v1/payments`, JSON.stringify(payload));

  const response = await fetch(`${baseUrl}/api/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiToken}`,
    },
    body: JSON.stringify(payload),
  });

  const bodyText = await response.text();
  console.log(`Payadmit API Status: ${response.status}. Response Body: ${bodyText}`);

  let responseData: PayadmitPaymentResponse;
  try {
    responseData = JSON.parse(bodyText);
  } catch (e) {
    throw new Error(`Invalid JSON response from Payadmit API (Status ${response.status})`);
  }

  if (response.status >= 400 || responseData.error || responseData.status === "ERROR") {
    let errorMessage = "";
    if (responseData.message) {
      errorMessage = responseData.message;
    } else if (responseData.violations && Array.isArray(responseData.violations)) {
      errorMessage = responseData.violations
        .map((v) => (v.field ? `${v.field}: ${v.message || v.error}` : `${v.message || v.error}`))
        .join("; ");
    } else if (responseData.errors && Array.isArray(responseData.errors)) {
      errorMessage = responseData.errors.join("; ");
    } else {
      errorMessage = responseData.error || `HTTP ${response.status} Error`;
    }
    throw new Error(`Payadmit API error: ${errorMessage}`);
  }

  const redirectUrl =
    responseData.redirectUrl ||
    responseData.url ||
    responseData.result?.redirectUrl;

  const paymentId =
    responseData.id ||
    responseData.paymentId ||
    responseData.result?.id;

  if (!redirectUrl) {
    throw new Error("Payadmit API error: Could not find redirect URL in response");
  }

  return {
    redirectUrl,
    paymentId: paymentId || "",
  };
}
