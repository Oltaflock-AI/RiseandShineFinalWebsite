"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCalls } from "@/lib/useCalls";
import { PageHeader } from "@/components/PageHeader";
import { initial, fmtWhen } from "@/lib/format";
import { IconStar, IconPlane } from "@/components/icons";

export default function Leads() {
  const { calls, loading } = useCalls();
  const [qualifiedOnly, setQualifiedOnly] = useState(true);

  const rows = useMemo(() => {
    return [...calls]
      .filter((c) => (qualifiedOnly ? c.qualified === true : true))
      .sort((a, b) => (b.started_at_unix ?? 0) - (a.started_at_unix ?? 0));
  }, [calls, qualifiedOnly]);

  const qualifiedCount = calls.filter((c) => c.qualified === true).length;

  return (
    <>
      <PageHeader title="Trips & Leads" subtitle="Qualified travel enquiries ready for your expert team" />

      <div className="kpis kpis-3">
        <div className="kpi">
          <div className="kpi-label">Qualified Leads</div>
          <div className="kpi-val num">{qualifiedCount}</div>
          <div className="kpi-sub">ready to follow up</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Callbacks Booked</div>
          <div className="kpi-val num">{calls.filter((c) => c.fields.callback_time).length}</div>
          <div className="kpi-sub">1–4 PM slots</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Total Enquiries</div>
          <div className="kpi-val num">{calls.length}</div>
          <div className="kpi-sub">all calls</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">{qualifiedOnly ? "Qualified Leads" : "All Leads"}</div>
          <label className="switch">
            <input type="checkbox" checked={qualifiedOnly} onChange={(e) => setQualifiedOnly(e.target.checked)} />
            <span>Qualified only</span>
          </label>
        </div>
        <div className="panel-body flush">
          {loading ? (
            <div className="panel-empty">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="panel-empty">
              {qualifiedOnly ? "No qualified leads yet — they show up here after a successful call." : "No leads yet."}
            </div>
          ) : (
            <div className="trip-table">
              <div className="trip-row trip-head">
                <span>Lead</span>
                <span>Destination</span>
                <span>Travelers</span>
                <span>Month</span>
                <span>Callback</span>
                <span>Status</span>
              </div>
              {rows.map((c) => (
                <Link key={c.conversation_id} href={`/calls/${c.conversation_id}`} className="trip-row">
                  <span className="trip-lead">
                    <span className="avatar sm">{initial(c.name, c.phone)}</span>
                    <span className="trip-lead-text">
                      <span className="trip-name">{c.name ?? c.phone ?? "Unknown"}</span>
                      <span className="trip-when">{fmtWhen(c.started_at_unix)}</span>
                    </span>
                  </span>
                  <span className="trip-dest">
                    {c.fields.destination ? (
                      <><IconPlane className="trip-plane" /> {c.fields.destination}</>
                    ) : <span className="dim">—</span>}
                  </span>
                  <span>{c.fields.num_travelers ?? <span className="dim">—</span>}</span>
                  <span>{c.fields.travel_month ?? <span className="dim">—</span>}</span>
                  <span className="trip-cb">{c.fields.callback_time ?? <span className="dim">—</span>}</span>
                  <span>
                    {c.qualified === true ? (
                      <span className="badge q"><IconStar className="badge-star" /> Qualified</span>
                    ) : (
                      <span className="badge fail">Other</span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
