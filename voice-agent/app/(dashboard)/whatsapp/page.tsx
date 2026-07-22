"use client";

import { useEffect, useMemo, useState } from "react";
import { useCalls } from "@/lib/useCalls";
import { PageHeader } from "@/components/PageHeader";
import { initial, fmtWhen, buildWhatsAppMessages } from "@/lib/format";
import { IconWhatsApp } from "@/components/icons";

export default function WhatsAppTab() {
  const { calls, loading } = useCalls();

  // Only calls that captured at least a destination produce a meaningful recap.
  const recipients = useMemo(
    () => calls.filter((c) => c.phone && (c.fields.destination || c.summary)),
    [calls],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedId && recipients.length) setSelectedId(recipients[0].conversation_id);
  }, [recipients, selectedId]);

  const selected = recipients.find((c) => c.conversation_id === selectedId) ?? null;
  const messages = selected ? buildWhatsAppMessages(selected) : [];

  return (
    <>
      <PageHeader title="WhatsApp" subtitle="The recap auto-sent to each buyer after their call" />

      {loading ? (
        <div className="panel"><div className="panel-empty">Loading…</div></div>
      ) : recipients.length === 0 ? (
        <div className="panel"><div className="panel-empty">No calls yet — recaps appear here after a call completes.</div></div>
      ) : (
        <div className="wa-layout">
          {/* Chat list */}
          <div className="wa-list">
            <div className="wa-list-head">Chats <span className="wa-list-count">{recipients.length}</span></div>
            {recipients.map((c) => {
              const preview = `Namaste ${c.name ?? "there"}! Thank you for speaking with Priya…`;
              return (
                <button
                  key={c.conversation_id}
                  className={`wa-chat${selectedId === c.conversation_id ? " active" : ""}`}
                  onClick={() => setSelectedId(c.conversation_id)}
                >
                  <span className="wa-avatar">{initial(c.name, c.phone)}</span>
                  <span className="wa-chat-main">
                    <span className="wa-chat-top">
                      <span className="wa-chat-name">{c.name ?? c.phone}</span>
                      <span className="wa-chat-time">{fmtWhen(c.started_at_unix)}</span>
                    </span>
                    <span className="wa-chat-preview">{preview}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Phone / conversation */}
          <div className="wa-phone">
            {selected && (
              <>
                <div className="wa-topbar">
                  <span className="wa-avatar lg">{initial(selected.name, selected.phone)}</span>
                  <span className="wa-topbar-id">
                    <span className="wa-topbar-name">Rise &amp; Shine Travel</span>
                    <span className="wa-topbar-sub">business account</span>
                  </span>
                  <IconWhatsApp className="wa-topbar-icon" />
                </div>

                <div className="wa-thread">
                  <div className="wa-day">TODAY</div>
                  <div className="wa-sys">🔒 Messages are end-to-end encrypted.</div>
                  {messages.map((msg, i) => (
                    <div className="wa-bubble in" key={i}>
                      <span className="wa-text">{renderWa(msg)}</span>
                      <span className="wa-time">12:3{i}</span>
                    </div>
                  ))}
                </div>

                <div className="wa-inputbar">
                  <span className="wa-fakeinput">Message · delivery not connected (demo)</span>
                  <span className="wa-send"><IconWhatsApp className="i" /></span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Render *bold* segments (WhatsApp markdown) as <b>.
function renderWa(text: string) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((p, i) =>
    p.startsWith("*") && p.endsWith("*") ? <b key={i}>{p.slice(1, -1)}</b> : <span key={i}>{p}</span>,
  );
}
