import { logger } from "../utils/log";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? "";
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

const BASE_URL = IS_PRODUCTION
  ? "https://app.midtrans.com"
  : "https://app.sandbox.midtrans.com";

const SNAP_BASE_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1"
  : "https://app.sandbox.midtrans.com/snap/v1";

function basicAuthHeader(): string {
  return `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64")}`;
}

export interface SnapTransactionParams {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    firstName: string;
    email: string;
  };
  itemDetails: {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }[];
}

export interface SnapTokenResponse {
  token: string;
  redirectUrl: string;
}

/**
 * Buat Midtrans Snap token untuk checkout.
 * Kembalikan token + redirect URL yang bisa dipakai client.
 */
export async function createSnapToken(params: SnapTransactionParams): Promise<SnapTokenResponse> {
  const body = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.grossAmount,
    },
    customer_details: {
      first_name: params.customerDetails.firstName,
      email: params.customerDetails.email,
    },
    item_details: params.itemDetails.map((item) => ({
      id: item.id,
      price: item.price,
      quantity: item.quantity,
      name: item.name,
    })),
  };

  const response = await fetch(`${SNAP_BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: basicAuthHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    logger.error("Midtrans Snap error", { status: response.status, body: errorBody });
    throw new Error(`Gagal membuat Snap token: ${response.status}`);
  }

  const data = (await response.json()) as { token: string; redirect_url: string };
  return { token: data.token, redirectUrl: data.redirect_url };
}

/**
 * Verifikasi signature notification dari Midtrans webhook.
 * Formula: SHA512(order_id + status_code + gross_amount + server_key)
 */
export async function verifyMidtransSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): Promise<boolean> {
  const raw = `${params.orderId}${params.statusCode}${params.grossAmount}${MIDTRANS_SERVER_KEY}`;

  // Web Crypto API (tersedia di Node 18+)
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computed = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return computed === params.signatureKey;
}

/**
 * Cek status transaksi langsung ke Midtrans (dipakai fallback jika webhook gagal).
 */
export async function getTransactionStatus(orderId: string): Promise<Record<string, unknown>> {
  const response = await fetch(`${BASE_URL}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: {
      Authorization: basicAuthHeader(),
    },
  });

  if (!response.ok) {
    throw new Error(`Gagal cek status transaksi Midtrans: ${response.status}`);
  }

  return (await response.json()) as Record<string, unknown>;
}
