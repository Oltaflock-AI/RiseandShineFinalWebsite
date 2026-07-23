import { Container } from "@/components/ui/Container";
import { RoomOptionsFallback } from "@/components/ui/SearchFallbacks";

export default function HotelDetailLoading() {
  return (
    <>
      <section className="bg-navy pb-8 pt-28 text-white sm:pt-32">
        <Container>
          <nav className="mb-3 text-[0.85rem] font-medium text-white/70">
            Home / <span className="text-white">Hotels</span>
          </nav>
          <span className="block h-9 w-72 max-w-full animate-pulse rounded bg-white/20" />
          <span className="mt-3 block h-4 w-52 animate-pulse rounded bg-white/15" />
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          {/* gallery skeleton */}
          <div className="mb-10 grid gap-2 overflow-hidden rounded-brand-lg sm:grid-cols-4 sm:grid-rows-2" aria-hidden>
            <span className="h-40 animate-pulse bg-cream-2 sm:col-span-2 sm:row-span-2 sm:min-h-[21rem]" />
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="hidden animate-pulse bg-cream-2 sm:block sm:min-h-[10rem]" />
            ))}
          </div>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <RoomOptionsFallback />
            </div>
            <aside className="h-fit space-y-6" aria-hidden>
              <span className="block h-32 animate-pulse rounded-brand-lg bg-cream-2" />
              <span className="block h-48 animate-pulse rounded-brand-lg bg-cream-2" />
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
