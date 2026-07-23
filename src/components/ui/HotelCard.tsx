import { Star, BedDouble, Utensils, ShieldCheck, MapPin } from "lucide-react";
import { BookButton } from "@/components/ui/BookButton";
import { cn } from "@/lib/cn";
import type { HotelOffer } from "@/lib/tbo-hotel";

/** TBO ratings arrive as words ("FourStar") or ints — normalize to 0–5. */
function starCount(rating?: string): number {
  if (!rating) return 0;
  const words: Record<string, number> = {
    onestar: 1,
    twostar: 2,
    threestar: 3,
    fourstar: 4,
    fivestar: 5,
  };
  const key = rating.toLowerCase().replace(/[^a-z]/g, "");
  if (words[key]) return words[key];
  const n = parseInt(rating, 10);
  return Number.isFinite(n) ? Math.max(0, Math.min(5, n)) : 0;
}

export type HotelStub = { name?: string; rating?: string; address?: string; cityName?: string };

export function HotelCard({
  offer,
  stub,
  nights,
  checkIn,
  checkOut,
  rooms,
  adults,
  childAges,
  cityLabel,
}: {
  offer: HotelOffer;
  stub?: HotelStub;
  nights: number;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  /** Ages of children per room (uniform occupancy), empty = adults only. */
  childAges?: number[];
  cityLabel: string;
}) {
  const cheapest = offer.rooms[0];
  const stars = starCount(stub?.rating);
  const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: offer.currency || "INR",
    maximumFractionDigits: 0,
  });

  // Everything the hotel checkout needs to PreBook + Book this room.
  const query: Record<string, string> = {
    bookingCode: cheapest?.bookingCode ?? "",
    hotel: stub?.name || `Hotel ${offer.hotelCode}`,
    city: cityLabel,
    checkIn,
    checkOut,
    nights: String(nights),
    rooms: String(rooms),
    adults: String(adults),
    ...(childAges?.length ? { children: String(childAges.length), ages: childAges.join(",") } : {}),
    fare: String(offer.cheapestFare),
    currency: offer.currency || "INR",
    room: cheapest?.name ?? "Room",
    meal: cheapest?.mealType ?? "",
    refundable: cheapest?.isRefundable ? "1" : "0",
  };

  return (
    <div className="flex flex-col gap-4 rounded-brand-lg border border-line bg-white p-5 shadow-brand-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[1.05rem] font-bold text-ink">
            {stub?.name || `Hotel ${offer.hotelCode}`}
          </h3>
          {stars > 0 && (
            <span className="flex flex-none items-center gap-0.5 text-red" aria-label={`${stars} star`}>
              {Array.from({ length: stars }).map((_, i) => (
                <Star key={i} size={13} fill="currentColor" strokeWidth={0} aria-hidden />
              ))}
            </span>
          )}
        </div>

        {stub?.address && (
          <p className="mt-1 flex items-center gap-1.5 truncate text-[0.85rem] text-muted">
            <MapPin size={13} className="flex-none text-red" aria-hidden />
            <span className="truncate">{stub.address}</span>
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.82rem] text-muted">
          <span className="inline-flex items-center gap-1">
            <BedDouble size={14} className="text-red" aria-hidden />
            {cheapest?.name || "Room"}
          </span>
          {cheapest?.mealType && cheapest.mealType.toLowerCase() !== "room only" && (
            <span className="inline-flex items-center gap-1">
              <Utensils size={14} className="text-red" aria-hidden />
              {cheapest.mealType}
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1",
              cheapest?.isRefundable ? "text-green-700" : "text-muted",
            )}
          >
            <ShieldCheck size={14} aria-hidden />
            {cheapest?.isRefundable ? "Refundable" : "Non-refundable"}
          </span>
        </div>
      </div>

      <div className="flex flex-none items-end justify-between gap-4 sm:flex-col sm:items-end">
        <div className="text-right">
          <div className="text-[1.25rem] font-extrabold text-navy">{money.format(offer.cheapestFare)}</div>
          <div className="text-[0.75rem] text-muted">
            total · {nights} night{nights > 1 ? "s" : ""}
          </div>
        </div>
        <BookButton query={query} path="/hotels/checkout" label="Book" />
      </div>
    </div>
  );
}
