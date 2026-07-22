import { NextRequest, NextResponse } from "next/server";
import { getLiveCallStatus } from "@/lib/elevenlabs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET ?conversation_id=conv_… → live phase (ringing/connected/ended) for the
// in-flight call. The dashboard polls this every ~2s while a call is active.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("conversation_id");
  if (!id) return NextResponse.json({ error: "conversation_id required" }, { status: 400 });
  try {
    return NextResponse.json(await getLiveCallStatus(id));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // 404 right after dialing is normal — report unknown, don't error.
    return NextResponse.json({ conversation_id: id, phase: "unknown", error: msg });
  }
}
