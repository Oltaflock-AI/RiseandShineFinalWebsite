"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";
import { ArrowRightLeft, MapPin, PlaneTakeoff, Users } from "lucide-react";
import { AIRPORTS } from "@/data/airports";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { cn } from "@/lib/cn";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex flex-col gap-1 border-b border-line px-5 py-3.5 last:border-0 lg:border-b-0 lg:[&:not(:first-child)]:border-l",
        className,
      )}
    >
      <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full bg-transparent text-[0.95rem] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted/70";

const iso = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export function SearchBar({
  initial,
  overlap = true,
}: {
  initial?: {
    from?: string;
    to?: string;
    depart?: string;
    return?: string;
    adults?: string;
    trip?: "oneway" | "round";
  };
  /** Pull up to overlap the hero (home). Set false when used inline. */
  overlap?: boolean;
}) {
  const router = useRouter();
  const listId = useId();
  const [trip, setTrip] = useState<"oneway" | "round">(initial?.trip ?? "oneway");
  const [from, setFrom] = useState(initial?.from || "Ahmedabad (AMD)");
  const [to, setTo] = useState(initial?.to ?? "");
  const [depart, setDepart] = useState(initial?.depart ?? "");
  const [ret, setRet] = useState(initial?.return ?? "");
  const [adults, setAdults] = useState(initial?.adults ?? "1");
  const [today, setToday] = useState("");

  // Prefill dates on the client to avoid SSR/hydration mismatch.
  useEffect(() => {
    setToday(iso(0));
    setDepart((d) => d || iso(14));
    setRet((r) => r || iso(21));
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!to.trim()) return;
    const p = new URLSearchParams({
      from: from.trim() || "Ahmedabad (AMD)",
      to: to.trim(),
      adults,
      trip,
    });
    if (depart) p.set("depart", depart);
    if (trip === "round" && ret) p.set("return", ret);
    router.push(`/flights?${p.toString()}`);
  };

  return (
    <div className={cn("relative z-20", overlap && "-mt-16")}>
      <Container>
        <div className="overflow-hidden rounded-[22px] bg-white shadow-brand-lg">
          {/* trip toggle */}
          <div className="flex gap-1 border-b border-line px-5 pt-4">
            {(["oneway", "round"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTrip(t)}
                className={cn(
                  "rounded-t-lg px-4 py-2 text-[0.85rem] font-semibold transition-colors",
                  trip === t
                    ? "bg-red/10 text-red"
                    : "text-muted hover:text-ink",
                )}
              >
                {t === "oneway" ? "One-way" : "Round-trip"}
              </button>
            ))}
          </div>

          <form
            onSubmit={onSubmit}
            className="relative grid lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_0.9fr_auto]"
            aria-label="Search flights"
          >
            <span className="grad-red absolute inset-y-0 left-0 hidden w-[6px] lg:block" aria-hidden />
            <Field label="From">
              <div className="flex items-center gap-2">
                <PlaneTakeoff size={17} className="flex-none text-red" aria-hidden />
                <input
                  list={listId}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  onFocus={(e) => e.currentTarget.select()}
                  placeholder="Ahmedabad (AMD)"
                  aria-label="From airport"
                  className={inputCls}
                />
              </div>
            </Field>
            <Field label="To">
              <div className="flex items-center gap-2">
                <MapPin size={17} className="flex-none text-red" aria-hidden />
                <input
                  list={listId}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  onFocus={(e) => e.currentTarget.select()}
                  placeholder="Where to?"
                  aria-label="To airport"
                  required
                  className={inputCls}
                />
              </div>
            </Field>
            <Field label="Depart">
              <input
                type="date"
                value={depart}
                min={today || undefined}
                onChange={(e) => setDepart(e.target.value)}
                aria-label="Departure date"
                className={inputCls}
              />
            </Field>
            <Field
              label="Return"
              className={trip === "oneway" ? "opacity-40" : undefined}
            >
              <input
                type="date"
                value={ret}
                min={depart || today || undefined}
                disabled={trip === "oneway"}
                onChange={(e) => setRet(e.target.value)}
                aria-label="Return date"
                className={inputCls}
              />
            </Field>
            <Field label="Travellers">
              <div className="flex items-center gap-2">
                <Users size={17} className="flex-none text-red" aria-hidden />
                <select
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                  aria-label="Adults"
                  className={cn(inputCls, "cursor-pointer")}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} Adult{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
            <div className="grid place-items-center p-3.5">
              <Button type="submit" arrow fullWidth>
                Search Flights
              </Button>
            </div>
          </form>
        </div>
        <p
          className={cn(
            "mt-3 flex items-center justify-center gap-1.5 text-center text-[0.8rem]",
            overlap ? "text-muted" : "text-white/85",
          )}
        >
          <ArrowRightLeft size={13} aria-hidden />
          Live fares across 500+ airlines, powered by our booking system.
        </p>
      </Container>

      <datalist id={listId}>
        {AIRPORTS.map((a) => (
          <option key={a.code} value={`${a.city} (${a.code})`}>
            {a.name}
          </option>
        ))}
      </datalist>
    </div>
  );
}
