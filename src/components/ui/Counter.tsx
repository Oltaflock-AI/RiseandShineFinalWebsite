"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animated count-up that triggers when scrolled into view.
 *
 * Robustness contract (per the content brief — a counter must NEVER render 0):
 *  - Initial state is the real `value`, so SSR / no-JS / hydration-failure all
 *    render the true number.
 *  - The count-up only runs on the client, and a safety timeout guarantees the
 *    final value is set even if requestAnimationFrame is starved (backgrounded
 *    tab, heavy throttling, etc.), so it can never get stuck mid-animation at 0.
 */
export function Counter({
  value,
  suffix = "",
  duration = 1400,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // No animation path: the real value is already displayed — leave it.
    if (prefersReduced || typeof requestAnimationFrame === "undefined") {
      return;
    }

    let raf = 0;
    let safety = 0;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      setDisplay(value);
    };

    const run = () => {
      if (started.current) return;
      started.current = true;

      // Guarantee the real value lands even if rAF never progresses.
      safety = window.setTimeout(finish, duration + 400);

      let startTs = 0;
      const tick = (now: number) => {
        if (done) return;
        if (!startTs) startTs = now;
        const p = Math.min((now - startTs) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(Math.round(eased * value));
        if (p < 1) raf = requestAnimationFrame(tick);
        else finish();
      };
      setDisplay(0);
      raf = requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      run();
      return () => {
        if (raf) cancelAnimationFrame(raf);
        if (safety) clearTimeout(safety);
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            run();
            io.disconnect();
          }
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (safety) clearTimeout(safety);
    };
  }, [value, duration]);

  return (
    <span ref={ref}>
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
