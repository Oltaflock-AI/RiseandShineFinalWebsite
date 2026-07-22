import { preBookHotel } from "@/lib/tbo-hotel";

// Live TBO re-price — never cached.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/hotels/quote — PreBook a searched room.
 *
 * The checkout page calls this before collecting guest details: it re-confirms
 * the price and returns `validation` (PAN / passport / GST rules) so the form can
 * ask for exactly what TBO requires — the hotel analogue of flight FareQuote.
 *
 * Body: { bookingCode, paymentMode? }
 */
export async function POST(req: Request) {
  let body: { bookingCode?: string; paymentMode?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.bookingCode) {
    return Response.json({ ok: false, error: 'Missing "bookingCode".' }, { status: 400 });
  }

  const result = await preBookHotel({ bookingCode: body.bookingCode, paymentMode: body.paymentMode });
  return Response.json(result, { status: result.ok ? 200 : 502 });
}
