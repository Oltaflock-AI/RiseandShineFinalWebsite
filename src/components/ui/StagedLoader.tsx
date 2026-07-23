"use client";

import { useEffect, useState } from "react";
import { PlaneLoader } from "@/components/ui/PlaneLoader";

/**
 * PlaneLoader whose message advances while the user waits, so a slow TBO
 * search (international can run 20–30s) reads as "working", not "broken".
 * Stage i shows after `atSeconds[i]` seconds; the last stage sticks.
 */
export function StagedLoader({
  stages,
  atSeconds = [0, 6, 14],
  sub,
  className,
}: {
  stages: string[];
  atSeconds?: number[];
  sub?: string;
  className?: string;
}) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = atSeconds
      .map((s, i) => (i === 0 ? null : setTimeout(() => setStage(i), s * 1000)))
      .filter((t): t is ReturnType<typeof setTimeout> => t !== null);
    return () => timers.forEach(clearTimeout);
  }, [atSeconds]);

  const i = Math.min(stage, stages.length - 1);
  return <PlaneLoader message={stages[i]} sub={sub} className={className} />;
}
