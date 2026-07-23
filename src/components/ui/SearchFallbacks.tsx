import { StagedLoader } from "@/components/ui/StagedLoader";

/**
 * Suspense fallbacks for the live-search sections: branded staged loader on
 * top, shimmering skeleton result cards below. Rendered INSTANTLY on search
 * (the header + search bar stay interactive above) so a click always visibly
 * does something while TBO thinks.
 */

export function FlightSkeletonCard() {
  return (
    <div className="flex flex-col gap-4 rounded-brand-lg border border-line bg-white p-5 shadow-brand-sm sm:flex-row sm:items-center sm:gap-6">
      <div className="flex items-center gap-3 sm:w-44 sm:flex-none">
        <span className="h-10 w-10 flex-none animate-pulse rounded-lg bg-cream-2" />
        <span className="h-4 w-24 animate-pulse rounded bg-cream-2" />
      </div>
      <div className="flex flex-1 items-center justify-between gap-4">
        <span className="h-5 w-12 animate-pulse rounded bg-cream-2" />
        <span className="hidden h-3 max-w-[200px] flex-1 animate-pulse rounded bg-cream-2 sm:block" />
        <span className="h-5 w-12 animate-pulse rounded bg-cream-2" />
      </div>
      <div className="flex flex-col items-end gap-2 sm:w-32 sm:flex-none">
        <span className="h-6 w-20 animate-pulse rounded bg-cream-2" />
        <span className="h-9 w-24 animate-pulse rounded-full bg-cream-2" />
      </div>
    </div>
  );
}

export function HotelSkeletonCard() {
  return (
    <div className="flex flex-col gap-4 rounded-brand-lg border border-line bg-white p-4 shadow-brand-sm sm:flex-row sm:items-center">
      <span className="h-40 w-full flex-none animate-pulse rounded-brand bg-cream-2 sm:h-32 sm:w-44" />
      <div className="flex-1 space-y-2.5">
        <span className="block h-5 w-2/3 animate-pulse rounded bg-cream-2" />
        <span className="block h-3.5 w-1/2 animate-pulse rounded bg-cream-2" />
        <span className="block h-3.5 w-3/4 animate-pulse rounded bg-cream-2" />
      </div>
      <div className="flex flex-none flex-col items-end gap-2 sm:w-36">
        <span className="h-6 w-24 animate-pulse rounded bg-cream-2" />
        <span className="h-10 w-28 animate-pulse rounded-full bg-cream-2" />
      </div>
    </div>
  );
}

export function FlightResultsFallback() {
  return (
    <>
      <StagedLoader
        stages={[
          "Searching live flight fares…",
          "Still comparing airlines — this can take up to 30 seconds…",
          "Almost there — confirming the best fares…",
        ]}
        sub="Comparing 500+ airlines for the best price"
        className="py-6"
      />
      <div className="mt-10 space-y-4" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <FlightSkeletonCard key={i} />
        ))}
      </div>
    </>
  );
}

export function HotelResultsFallback({ cityLabel }: { cityLabel?: string }) {
  return (
    <>
      <StagedLoader
        stages={[
          cityLabel ? `Checking live rates across ${cityLabel} hotels…` : "Checking live hotel rates…",
          "Still confirming availability — busy dates can take a little longer…",
          "Almost there — lining up the best rooms…",
        ]}
        sub="Live availability from our booking system"
        className="py-6"
      />
      <div className="mt-10 space-y-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <HotelSkeletonCard key={i} />
        ))}
      </div>
    </>
  );
}

export function RoomOptionsFallback() {
  return (
    <>
      <StagedLoader
        stages={[
          "Fetching every room option…",
          "Still confirming room rates — nearly done…",
        ]}
        atSeconds={[0, 8]}
        sub="Live prices for each room type"
        className="py-4"
      />
      <div className="mt-6 space-y-4" aria-hidden>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 rounded-brand-lg border border-line bg-white p-5 shadow-brand-sm">
            <div className="flex-1 space-y-2.5">
              <span className="block h-4.5 w-1/2 animate-pulse rounded bg-cream-2" />
              <span className="block h-3.5 w-2/3 animate-pulse rounded bg-cream-2" />
            </div>
            <div className="flex flex-none flex-col items-end gap-2">
              <span className="h-5 w-20 animate-pulse rounded bg-cream-2" />
              <span className="h-10 w-24 animate-pulse rounded-full bg-cream-2" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
