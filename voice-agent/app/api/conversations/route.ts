import { NextResponse } from "next/server";
import { listCalls } from "@/lib/elevenlabs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET → recent calls (with summary + collected travel details) for the feed.
export async function GET() {
  try {
    const calls = await listCalls(25);
    return NextResponse.json({ calls });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg, calls: [] }, { status: 500 });
  }
}
