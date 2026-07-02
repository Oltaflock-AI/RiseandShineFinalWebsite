import { site } from "@/data/site";
import { Stars } from "./Stars";
import { cn } from "@/lib/cn";

/**
 * Trust signal built around the real, audit-verified aggregate Google rating
 * (see `site.reviews`). Numbers live in data, not markup, so swapping the
 * hardcoded value for a live Google Places feed later is a one-file change.
 */
export function GoogleReviews({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const { rating, count, url } = site.reviews;
  const ratingText = rating.toFixed(1);
  const label = `Rated ${ratingText} out of 5 from ${count} Google reviews`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}. Read them on Google`}
      className={cn(
        "group inline-flex items-center gap-3.5 rounded-full transition-opacity hover:opacity-90",
        className,
      )}
    >
      <Stars
        className={tone === "dark" ? "text-white" : "text-red"}
        size={16}
        label={label}
      />
      <span
        className={cn(
          "text-[0.88rem]",
          tone === "dark" ? "text-white/80" : "text-muted",
        )}
      >
        <b
          className={cn(
            "font-semibold",
            tone === "dark" ? "text-white" : "text-ink",
          )}
        >
          {ratingText}/5
        </b>{" "}
        from {count} Google reviews
      </span>
    </a>
  );
}
