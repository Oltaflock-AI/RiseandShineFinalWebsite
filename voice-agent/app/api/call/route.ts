import { NextRequest, NextResponse } from "next/server";
import { placeOutboundCall } from "@/lib/elevenlabs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { name, phone } → place an outbound call to the lead with the voice agent.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name: string = String(body?.name ?? "").trim();
  const phone: string = String(body?.phone ?? "").trim();

  if (!name) return NextResponse.json({ error: "Full name is required" }, { status: 400 });
  if (!phone || phone.replace(/[^\d]/g, "").length < 10)
    return NextResponse.json({ error: "A valid WhatsApp number is required" }, { status: 400 });

  try {
    const r = await placeOutboundCall({ toNumber: phone, calleeName: name });
    return NextResponse.json({
      ok: true,
      conversation_id: r.conversation_id,
      sip_call_id: r.sip_call_id,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
