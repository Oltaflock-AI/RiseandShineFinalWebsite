import type { CallRecord, TripFields } from "./types";

export function fmtDuration(s: number | null): string {
  if (s == null) return "—";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

export function fmtWhen(unix: number | null): string {
  if (!unix) return "";
  const d = new Date(unix * 1000);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function fmtAbsolute(unix: number | null): string {
  if (!unix) return "—";
  return new Date(unix * 1000).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initial(name: string | null, phone: string | null): string {
  const s = (name ?? phone ?? "?").trim();
  return s.slice(0, 1).toUpperCase() || "?";
}

// True once the call has produced a real conversation (picked up).
export function isConnected(c: CallRecord): boolean {
  return (c.duration_secs ?? 0) > 0;
}

export function hasCallback(c: CallRecord): boolean {
  return !!c.fields.callback_time;
}

// Labelled, non-empty trip fields — used for chips and the detail grid.
const FIELD_LABELS: [keyof TripFields, string][] = [
  ["destination", "Destination"],
  ["num_travelers", "Travelers"],
  ["travel_month", "Travel month"],
  ["special_requests", "Special requests"],
  ["whatsapp_number", "WhatsApp"],
  ["callback_time", "Callback"],
];

export function tripChips(c: CallRecord): { label: string; value: string }[] {
  return FIELD_LABELS.map(([key, label]) => ({ label, value: c.fields[key] }))
    .filter((x): x is { label: string; value: string } => !!x.value);
}

// Build the WhatsApp message(s) Rise & Shine would auto-send the buyer after the
// call — ONLY the things Priya asked for (no sentiment, score, or internal data).
// Returns one or more chat bubbles.
export function buildWhatsAppMessages(c: CallRecord): string[] {
  const name = c.name?.trim() || "there";
  const f = c.fields;

  const lines: string[] = [];
  if (f.destination) lines.push(`✈️ *Destination* — ${f.destination}`);
  if (f.num_travelers) lines.push(`👥 *Travelers* — ${f.num_travelers}`);
  if (f.travel_month) lines.push(`🗓️ *Travel month* — ${f.travel_month}`);
  if (f.special_requests) lines.push(`✨ *Special requests* — ${f.special_requests}`);

  const summary =
    `Namaste ${name}! 🙏\n\n` +
    `Thank you for speaking with *Priya* from *Rise & Shine Travel*. ` +
    `Here's a quick summary of your travel enquiry:` +
    (lines.length ? `\n\n${lines.join("\n")}` : "");

  const callbackLine = f.callback_time
    ? `📞 Our travel expert will call you back *${f.callback_time}* with a custom itinerary and quote.`
    : `📞 Our travel expert will call you back soon with a custom itinerary and quote.`;

  const next =
    `${callbackLine}\n\n` +
    `We'll share your personalised itinerary link right here on WhatsApp. ` +
    `See you soon! 🌅`;

  return [summary, next];
}
