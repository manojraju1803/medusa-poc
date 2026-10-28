import { createHmac, timingSafeEqual } from 'crypto';

// How long an invoice link opened from the admin stays valid.
export const INVOICE_TOKEN_TTL_MS = 15 * 60 * 1000;

const signature = (orderId: string, expiresAt: number, secret: string) =>
  createHmac('sha256', secret)
    .update(`invoice:${orderId}:${expiresAt}`)
    .digest('base64url');

/**
 * A short-lived token that lets the storefront read one order for its
 * invoice, for an admin who is not that order's buyer.
 */
export function signInvoiceToken(
  orderId: string,
  secret: string,
  now = Date.now(),
): string {
  const expiresAt = now + INVOICE_TOKEN_TTL_MS;
  return `${expiresAt}.${signature(orderId, expiresAt, secret)}`;
}

export function verifyInvoiceToken(
  orderId: string,
  token: string,
  secret: string,
  now = Date.now(),
): boolean {
  const [expires, given] = token.split('.');
  const expiresAt = Number(expires);
  if (!given || !Number.isSafeInteger(expiresAt) || expiresAt < now) {
    return false;
  }

  const expected = Buffer.from(signature(orderId, expiresAt, secret));
  const actual = Buffer.from(given);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
