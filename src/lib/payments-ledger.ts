import "server-only";

/**
 * Razorpay reconciliation ledger (SERVER ONLY).
 *
 * An independent money record, separate from the TBO booking mirror in `bookings`.
 * The webhook (/api/payment/webhook) upserts every payment/refund event here, so we
 * can reconcile "money captured" against "ticket issued" — e.g. find a captured
 * payment with no ticketed booking (an orphan that needs a manual refund). Written
 * with the service-role key (bypasses RLS); customers never read it.
 */
import { createAdminClient, supabaseAdminConfigured } from "@/lib/supabase/admin";

export type PaymentEvent = {
  paymentId: string;
  orderId?: string;
  status: "captured" | "failed" | "refunded";
  amountInr?: number;
  method?: string;
  email?: string;
  contact?: string;
  traceId?: string;
  refundedAt?: string; // ISO timestamp
};

/**
 * Upsert one payment event keyed by `razorpay_payment_id`. Only the fields present on
 * `ev` are written, so a later refund event won't clobber the captured amount. Throws
 * on a DB error (the webhook returns non-2xx so Razorpay retries).
 */
export async function recordPaymentEvent(ev: PaymentEvent): Promise<void> {
  if (!supabaseAdminConfigured || !ev.paymentId) return;

  const row: Record<string, unknown> = {
    razorpay_payment_id: ev.paymentId,
    status: ev.status,
    updated_at: new Date().toISOString(),
  };
  if (ev.orderId) row.razorpay_order_id = ev.orderId;
  if (ev.amountInr != null) row.amount_inr = ev.amountInr;
  if (ev.method) row.method = ev.method;
  if (ev.email) row.email = ev.email;
  if (ev.contact) row.contact = ev.contact;
  if (ev.traceId) row.trace_id = ev.traceId;
  if (ev.refundedAt) row.refunded_at = ev.refundedAt;

  const admin = createAdminClient();
  const { error } = await admin.from("payments").upsert(row, { onConflict: "razorpay_payment_id" });
  if (error) throw error;
}
