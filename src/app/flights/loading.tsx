import { Container } from "@/components/ui/Container";
import { PlaneLoader } from "@/components/ui/PlaneLoader";

function SkeletonCard() {
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

export default function FlightsLoading() {
  return (
    <>
      <section className="bg-navy pb-8 pt-28 text-white sm:pt-32">
        <Container>
          <nav className="mb-3 text-[0.85rem] font-medium text-white/70">
            Home / <span className="text-white">Flights</span>
          </nav>
          <h1 className="h-md text-white">Search flights</h1>
          <p className="mt-2 text-white/70">
            Fetching live fares from our booking system…
          </p>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <PlaneLoader
            message="Searching live flight fares…"
            sub="Comparing 500+ airlines for the best price"
            className="py-6"
          />
          <div className="mt-10 space-y-4" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
