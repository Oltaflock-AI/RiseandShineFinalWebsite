import { Container } from "@/components/ui/Container";
import { HotelResultsFallback } from "@/components/ui/SearchFallbacks";

export default function HotelsLoading() {
  return (
    <>
      <section className="bg-navy pb-8 pt-28 text-white sm:pt-32">
        <Container>
          <nav className="mb-3 text-[0.85rem] font-medium text-white/70">
            Home / <span className="text-white">Hotels</span>
          </nav>
          <h1 className="h-md text-white">Search hotels</h1>
          <p className="mt-2 text-white/70">Fetching live rates from our booking system…</p>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <HotelResultsFallback />
        </Container>
      </section>
    </>
  );
}
