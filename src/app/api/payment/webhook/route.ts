import { verifyWebhookSignature, razorpayWebhookConfigured } from "@/lib/razorpay";
import { recordPaymentEvent } from "@/lib/payments-ledger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * POST /api/payment/webhook — Razorpay server-to-server events (reconciliation).
 *
 * Independent of the browser checkout callback: even if the customer closes the tab
 * the instant they pay, this records the money movement into the payments ledger.
 * Configure it in Razorpay Dashboard → Settings → Webhooks with a secret
 * (RAZORPAY_WEBHOOK_SECRET) and the events: payment.captured, payment.failed,
 * refund.processed.
 *
 * Signature = HMAC-SHA256 of the RAW body keyed by the webhook secret — so we read
 * req.text() (never re-serialize) and verify before trusting anything. A write failure
 * returns 500 so Razorpay retries; an unknown event is acknowledged (200) so it won't.
 */
export async function POST(req: Request) {
  if (!razorpayWebhookConfigured) {
    return Response.json({ ok: false, error: "Webhook not configured." }, { status: 503 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) {
    return Response.json({ ok: false, error: "Invalid signature." }, { status: 400 });
  }

  let event: Json;
  try {
    event = JSON.parse(raw) as Json;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  try {
    switch (event.event) {
      case "payment.captured":
      case "payment.failed": {
        const p = (event.payload?.payment?.entity ?? {}) as Json;
        await recordPaymentEvent({
          paymentId: p.id,
          orderId: p.order_id,
          status: event.event === "payment.captured" ? "captured" : "failed",
          amountInr: p.amount != null ? Math.round(Number(p.amount) / 100) : undefined,
          method: p.method,
          email: p.email,
          contact: p.contact,
          traceId: p.notes?.traceId,
        });
        break;
      }
      case "refund.created":
      case "refund.processed": {
        const r = (event.payload?.refund?.entity ?? {}) as Json;
        await recordPaymentEvent({
          paymentId: r.payment_id,
          status: "refunded",
          refundedAt: r.created_at ? new Date(Number(r.created_at) * 1000).toISOString() : new Date().toISOString(),
        });
        break;
      }
      default:
        // Unhandled event type — acknowledge so Razorpay stops retrying.
        break;
    }
  } catch (e) {
    console.error("[api/payment/webhook] ledger write failed:", e);
    return Response.json({ ok: false }, { status: 500 }); // 5xx → Razorpay retries
  }

  return Response.json({ ok: true });
}
