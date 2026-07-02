import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { PlanTripForm } from "@/components/forms/PlanTripForm";
import { CATALOG_PACKAGES, isCatalogPackage } from "@/data/catalog";
import type { PackageCategory } from "@/data/catalog/types";

export const metadata: Metadata = {
  title: "Plan My Trip",
  description:
    "Tell us a few details and Rise & Shine Travels will craft a personalised itinerary and quote, completely free.",
  alternates: { canonical: "/plan-my-trip" },
};

const CATEGORY_JOURNEY: Record<PackageCategory, string> = {
  domestic: "Domestic",
  international: "International",
  cruise: "Cruise",
};

const VALID_JOURNEYS = new Set([
  "Domestic",
  "International",
  "Cruise",
  "Honeymoon",
  "Group / Corporate",
]);

export default async function PlanMyTripPage({
  searchParams,
}: {
  searchParams: Promise<{
    destination?: string;
    journey?: string;
    package?: string;
  }>;
}) {
  const sp = await searchParams;

  let defaultDestination = typeof sp.destination === "string" ? sp.destination : "";
  let defaultJourneyType =
    typeof sp.journey === "string" && VALID_JOURNEYS.has(sp.journey)
      ? sp.journey
      : "Domestic";
  let defaultMessage = "";
  let packageKey = "";

  // Pre-fill from a package detail-page CTA (?package=<key>).
  if (typeof sp.package === "string" && isCatalogPackage(sp.package)) {
    const pkg = CATALOG_PACKAGES[sp.package];
    packageKey = pkg.key;
    defaultDestination = pkg.name;
    defaultJourneyType = CATEGORY_JOURNEY[pkg.category];
    defaultMessage = `I'd like a quote for the ${pkg.tourName} (${pkg.durationNights}N/${pkg.durationDays}D) package covering ${pkg.routeSummary}. Please share pricing and availability.`;
  }

  return (
    <>
      <PageHero
        crumb="Plan My Trip"
        photoId="photo-1452421822248-d4c2b47f0c81"
        title="Plan my trip"
        subtitle="Tell us a few details and we'll craft a personalised itinerary and quote, completely free."
      />

      <section className="py-20 sm:py-28">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <PlanTripForm
                defaultDestination={defaultDestination}
                defaultJourneyType={defaultJourneyType}
                defaultMessage={defaultMessage}
                packageKey={packageKey}
              />
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
