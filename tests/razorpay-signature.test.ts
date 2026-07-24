/**
 * The two HMAC gates money passes through:
 *  - verifyPaymentSignature: checkout callback (orderId|paymentId keyed by KEY_SECRET)
 *  - verifyWebhookSignature: webhook raw body keyed by WEBHOOK_SECRET
 * A silent false-negative blocks bookings; a false-positive books unpaid tickets.
 */
import crypto from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { verifyPaymentSignature, verifyWebhookSignature } from "@/lib/razorpay";

const KEY_SECRET = "test_key_secret_123";
const WEBHOOK_SECRET = "test_webhook_secret_456";

const sign = (secret: string, payload: string) =>
  crypto.createHmac("sha256", secret).update(payload).digest("hex");

beforeAll(() => {
  process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
  process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
});

describe("verifyPaymentSignature", () => {
  const orderId = "order_Nxa1b2C3d4E5f6";
  const paymentId = "pay_Qz9y8X7w6V5u4t";
  const good = () => sign(KEY_SECRET, `${orderId}|${paymentId}`);

  it("accepts Razorpay's checkout signature", () => {
    expect(verifyPaymentSignature({ orderId, paymentId, signature: good() })).toBe(true);
  });

  it("rejects a signature for a different payment", () => {
    const other = sign(KEY_SECRET, `${orderId}|pay_SOMETHINGELSE`);
    expect(verifyPaymentSignature({ orderId, paymentId, signature: other })).toBe(false);
  });

  it("rejects a tampered signature of the right length", () => {
    const s = good();
    const flipped = (s[0] === "a" ? "b" : "a") + s.slice(1);
    expect(verifyPaymentSignature({ orderId, paymentId, signature: flipped })).toBe(false);
  });

  it("rejects (not throws) on a wrong-length signature", () => {
    expect(verifyPaymentSignature({ orderId, paymentId, signature: "deadbeef" })).toBe(false);
  });

  it("rejects an empty signature", () => {
    expect(verifyPaymentSignature({ orderId, paymentId, signature: "" })).toBe(false);
  });

  it("rejects everything when the secret is not configured", () => {
    const prev = process.env.RAZORPAY_KEY_SECRET;
    delete process.env.RAZORPAY_KEY_SECRET;
    try {
      expect(verifyPaymentSignature({ orderId, paymentId, signature: good() })).toBe(false);
    } finally {
      process.env.RAZORPAY_KEY_SECRET = prev;
    }
  });
});

describe("verifyWebhookSignature", () => {
  const rawBody = JSON.stringify({
    event: "payment.captured",
    payload: { payment: { entity: { id: "pay_123", amount: 574500 } } },
  });

  it("accepts the signature of the exact raw body", () => {
    expect(verifyWebhookSignature(rawBody, sign(WEBHOOK_SECRET, rawBody))).toBe(true);
  });

  it("rejects when the body changed after signing", () => {
    const sig = sign(WEBHOOK_SECRET, rawBody);
    expect(verifyWebhookSignature(rawBody.replace("574500", "1"), sig)).toBe(false);
  });

  it("rejects a re-serialized body (raw bytes matter)", () => {
    const pretty = JSON.stringify(JSON.parse(rawBody), null, 2);
    expect(verifyWebhookSignature(pretty, sign(WEBHOOK_SECRET, rawBody))).toBe(false);
  });

  it("rejects a signature made with the API key secret (separate secrets)", () => {
    expect(verifyWebhookSignature(rawBody, sign(KEY_SECRET, rawBody))).toBe(false);
  });

  it("rejects an empty signature", () => {
    expect(verifyWebhookSignature(rawBody, "")).toBe(false);
  });
});
