"use client";

import { useEffect, useState } from "react";
import { useCalls } from "@/lib/useCalls";
import { PageHeader } from "@/components/PageHeader";
import { IconPhone, IconCheck } from "@/components/icons";

interface ActiveCall {
  conversationId: string | null;
  name: string;
  phone: string;
  phase: string; // dialing | ringing | connected | ended | failed
}

const LIVE_POLL_MS = 2500;

const PHASE_LABEL: Record<string, string> = {
  dialing: "Placing call…",
  ringing: "Ringing the lead…",
  connected: "On the call with Priya",
  ended: "Call ended — collecting details",
  failed: "Call could not connect",
};

export default function SubmitForm() {
  const { refetch } = useCalls();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<ActiveCall | null>(null);
  const [done, setDone] = useState(false);

  // Poll the live status while a call is in flight.
  useEffect(() => {
    if (!active?.conversationId) return;
    let stop = false;
    const tick = async () => {
      try {
        const r = await fetch(`/api/status?conversation_id=${active.conversationId}`, { cache: "no-store" });
        const j = await r.json().catch(() => ({}));
        if (stop) return;
        if (j.phase && j.phase !== "unknown") setActive((a) => (a ? { ...a, phase: j.phase } : a));
        if (j.phase === "ended" || j.phase === "failed") {
          refetch();
          setDone(true);
          setTimeout(() => setActive(null), 4500);
          stop = true;
        }
      } catch {
        /* transient */
      }
    };
    tick();
    const id = setInterval(tick, LIVE_POLL_MS);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [active?.conversationId, refetch]);

  const placeCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(false);
    if (!name.trim()) return setError("Please enter the lead's full name.");
    if (phone.replace(/[^\d]/g, "").length < 10) return setError("Please enter a valid WhatsApp number.");

    setSubmitting(true);
    setActive({ conversationId: null, name: name.trim(), phone: phone.trim(), phase: "dialing" });
    try {
      const r = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Failed to place call");
      setActive({ conversationId: j.conversation_id, name: name.trim(), phone: phone.trim(), phase: "ringing" });
      setName("");
      setPhone("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place call");
      setActive(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Submit Form" subtitle="Enter a lead and Priya places the call instantly" />

      <div className="submit-grid">
        {/* Form */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">New Travel Enquiry</div>
            <span className="panel-sub">outbound</span>
          </div>
          <div className="panel-body">
            <form onSubmit={placeCall}>
              <div className="field">
                <label className="label" htmlFor="name">Full name</label>
                <input id="name" className="input" placeholder="e.g. Rohan Mehta" value={name}
                  onChange={(e) => setName(e.target.value)} disabled={submitting} autoComplete="name" />
              </div>
              <div className="field">
                <label className="label" htmlFor="phone">WhatsApp number</label>
                <input id="phone" className="input" placeholder="e.g. 98765 43210" type="tel" inputMode="tel"
                  autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={submitting} />
                <div className="hint">Indian numbers auto-prefixed with +91. Priya will call this number.</div>
              </div>
              <button className="btn" type="submit" disabled={submitting || !!active}>
                {submitting ? <span className="spinner" aria-hidden /> : <IconPhone className="btn-icon" />}
                {submitting ? "Connecting…" : active ? "Call in progress" : "Call this lead"}
              </button>
              {error && (
                <div className="err" role="alert">
                  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
                    <circle cx="8" cy="8" r="6.5" /><path d="M8 5v3.5M8 11h.01" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
            </form>

            {active && (
              <div className="live" aria-live="polite">
                <div className="live-row">
                  <div className={`ring${active.phase === "ended" || active.phase === "failed" ? " stop" : ""}`}>
                    {done ? <IconCheck className="ring-icon" /> : <IconPhone className="ring-icon" />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="live-name">{active.name} · {active.phone}</div>
                    <div className="live-phase">{PHASE_LABEL[active.phase] ?? active.phase}</div>
                  </div>
                </div>
                {done && (
                  <div className="live-done">
                    Call complete. The summary &amp; collected details are now in <b>Voice Calls</b>.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="panel info-panel">
          <div className="panel-head">
            <div className="panel-title">How it works</div>
          </div>
          <div className="panel-body">
            <ol className="steps">
              <li><span className="step-n">1</span><div><b>You submit the form.</b> Name + WhatsApp number is all Priya needs.</div></li>
              <li><span className="step-n">2</span><div><b>Priya calls instantly</b> over the phone line and speaks in Hindi — qualifying destination, travelers, month &amp; special requests.</div></li>
              <li><span className="step-n">3</span><div><b>She locks a callback</b> with your expert team (1–4 PM) and confirms the WhatsApp number.</div></li>
              <li><span className="step-n">4</span><div><b>The call summary &amp; details</b> land in Voice Calls, and a WhatsApp recap is queued in the WhatsApp tab.</div></li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
