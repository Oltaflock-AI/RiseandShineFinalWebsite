"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCalls } from "@/lib/useCalls";
import { fmtWhen } from "@/lib/format";
import {
  IconOverview,
  IconPhonePlus,
  IconPhone,
  IconPlane,
  IconWhatsApp,
  IconSun,
} from "@/components/icons";

export function Sidebar() {
  const pathname = usePathname();
  const { calls, lastSync } = useCalls();

  const qualified = calls.filter((c) => c.qualified === true).length;

  const items = [
    { href: "/", label: "Overview", Icon: IconOverview, exact: true },
    { href: "/submit", label: "Submit Form", Icon: IconPhonePlus },
    { href: "/calls", label: "Voice Calls", Icon: IconPhone, count: calls.length },
    { href: "/leads", label: "Trips & Leads", Icon: IconPlane, count: qualified },
    { href: "/whatsapp", label: "WhatsApp", Icon: IconWhatsApp, count: calls.length },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="brand-mark"><IconSun className="brand-sun" /></span>
        <span>
          <span className="brand-title">Rise <em>&amp; Shine</em></span>
          <span className="brand-sub">AI Sales Engine</span>
        </span>
      </Link>

      <nav className="nav" aria-label="Primary">
        <div className="nav-group-label">Workspace</div>
        {items.map(({ href, label, Icon, count, exact }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item${isActive(href, exact) ? " active" : ""}`}
            aria-current={isActive(href, exact) ? "page" : undefined}
          >
            <Icon className="nav-icon" />
            <span className="nav-label">{label}</span>
            {count != null && count > 0 && <span className="nav-count">{count}</span>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="sync-mini">
          <span className="dot" /> Live · {fmtWhen(Math.floor(lastSync.getTime() / 1000))}
        </div>
        <div className="sidebar-org">Oltaflock · v1.0</div>
      </div>
    </aside>
  );
}
