import { Plane } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Branded loading animation: a plane sweeps along a dashed flight path,
 * drawing a red trail from the navy departure dot to the red arrival dot.
 * Used inside route `loading.tsx` Suspense boundaries.
 */
export function PlaneLoader({
  message = "Just a moment…",
  sub,
  className,
}: {
  message?: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      {/* flight path */}
      <div className="relative h-12 w-64 max-w-[80vw]">
        {/* base dashed route */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-navy/15" />
        {/* animated red trail */}
        <div className="grad-red animate-trail absolute left-0 top-1/2 h-[2px] w-0 -translate-y-1/2 rounded-full" />
        {/* departure dot */}
        <span className="absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-navy bg-white" />
        {/* arrival dot */}
        <span className="absolute right-0 top-1/2 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-red" />
        {/* plane */}
        <Plane
          size={26}
          className="animate-fly absolute top-1/2 fill-red text-red drop-shadow-sm"
          aria-hidden
        />
      </div>

      <div className="mt-6">
        <p className="text-script text-[1.6rem] leading-none text-red">
          Rise &amp; Shine
        </p>
        <p className="mt-2 font-semibold text-ink">{message}</p>
        {sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}
      </div>
    </div>
  );
}
