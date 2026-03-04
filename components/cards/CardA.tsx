import type { DestinationCard } from "@/lib/types";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  card: DestinationCard;
  onClick?: () => void;
}

// Variant A — "The Cover"
// Editorial magazine portrait. Imagery commands. Typography is spare and italic.
// Cormorant Garamond + Jost. Full-bleed hero, stacked print thumbnails.
export function CardA({ card, onClick }: Props) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer group select-none"
      style={{ aspectRatio: "3 / 4" }}
      onClick={onClick}
    >
      {/* Hero image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.images.hero}
        alt={card.destination.city}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Gradient — heavy at bottom, whisper at top */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 via-55% to-black/15" />

      {/* Top bar: weather pill + cost */}
      <div className="absolute top-5 left-5 right-5 flex items-start justify-between">
        <div
          className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10"
          style={{ fontFamily: "var(--font-jost)" }}
        >
          <WeatherIcon icon={card.weather.icon} size={13} />
          <span className="text-white/80 text-[11px] tracking-wide">
            {card.weather.avgTempC}°C
          </span>
        </div>

        <div className="text-right">
          <div
            className="text-white/35 text-[9px] tracking-[0.22em] uppercase"
            style={{ fontFamily: "var(--font-jost)" }}
          >
            from
          </div>
          <div
            className="text-white text-[28px] font-light leading-none"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            £{card.cost.total}
          </div>
        </div>
      </div>

      {/* Collage thumbnails — stacked prints, mid-right */}
      <div
        className="absolute right-5 flex flex-col gap-2.5"
        style={{ top: "28%" }}
      >
        {card.images.collage.slice(0, 2).map((url, i) => (
          <div
            key={i}
            className="overflow-hidden shadow-2xl"
            style={{
              width: 66,
              height: 66,
              border: "2.5px solid rgba(255,255,255,0.82)",
              borderRadius: "1px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
        <p
          className="text-white/30 text-[10px] tracking-[0.3em] uppercase mb-0.5"
          style={{ fontFamily: "var(--font-jost)" }}
        >
          {card.destination.country}
        </p>
        <h2
          className="text-white leading-[0.88] mb-4"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(46px, 9vw, 62px)",
            fontWeight: 300,
            fontStyle: "italic",
          }}
        >
          {card.destination.city}
        </h2>

        <div className="border-t border-white/10 pt-3">
          <ul className="space-y-2 mb-4">
            {card.highlights.slice(0, 3).map((h, i) => (
              <li
                key={i}
                className="flex items-baseline gap-2.5 text-white/55 text-[11px] leading-snug"
                style={{ fontFamily: "var(--font-jost)" }}
              >
                <span className="text-white/20 shrink-0 text-[7px]">◆</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>

          {/* Expand chevron */}
          <div className="flex justify-center">
            <svg
              className="text-white/25 group-hover:text-white/60 group-hover:translate-y-0.5 transition-all duration-300"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 18 18"
            >
              <path
                d="M9 4v10M4.5 9.5l4.5 4.5 4.5-4.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
