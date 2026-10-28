import {
  INVOICE_TOKEN_TTL_MS,
  signInvoiceToken,
  verifyInvoiceToken,
} from '../invoice-token';

const SECRET = 'test-secret';
const NOW = 1_700_000_000_000;

describe('invoice token', () => {
  const token = signInvoiceToken('order_a', SECRET, NOW);

  it('is valid for the order it was signed for', () => {
    expect(verifyInvoiceToken('order_a', token, SECRET, NOW)).toBe(true);
  });

  it('is not valid for another order', () => {
    expect(verifyInvoiceToken('order_b', token, SECRET, NOW)).toBe(false);
  });

  it('is not valid under another secret', () => {
    expect(verifyInvoiceToken('order_a', token, 'other', NOW)).toBe(false);
  });

  it('expires', () => {
    const later = NOW + INVOICE_TOKEN_TTL_MS + 1;
    expect(verifyInvoiceToken('order_a', token, SECRET, later)).toBe(false);
  });

  it('rejects a moved expiry and malformed tokens', () => {
    const [, sig] = token.split('.');
    const extended = `${NOW + INVOICE_TOKEN_TTL_MS * 10}.${sig}`;
    expect(verifyInvoiceToken('order_a', extended, SECRET, NOW)).toBe(false);
    expect(verifyInvoiceToken('order_a', '', SECRET, NOW)).toBe(false);
    expect(verifyInvoiceToken('order_a', 'abc', SECRET, NOW)).toBe(false);
    expect(verifyInvoiceToken('order_a', `${NOW + 1000}.x`, SECRET, NOW)).toBe(false);
  });
});
