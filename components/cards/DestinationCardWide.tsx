import type { DestinationCard } from "@/lib/types";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  card: DestinationCard;
  onClick?: () => void;
}

// Alternative layout: Wide cinematic / billboard
// Full-bleed photo, gradient from left creates dark zone for content
// City name very large — the photo and the name share equal billing
// Scattered polaroid prints bottom-right as an accent
export function DestinationCardWide({ card, onClick }: Props) {
  const { outbound } = card.flightInfo;

  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer group select-none"
      style={{ aspectRatio: "16 / 7" }}
      onClick={onClick}
    >
      {/* Hero image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.images.hero}
        alt={card.destination.city}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Left-to-right gradient — creates dark reading zone on left */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/96 via-black/70 via-38% to-black/10 to-68%" />
      {/* Bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent to-40%" />

      {/* Left content zone */}
      <div
        className="absolute inset-y-0 left-0 flex flex-col justify-between"
        style={{ width: "50%", padding: "clamp(16px, 3vw, 32px)" }}
      >
        {/* Country */}
        <p
          className="text-white/28 text-[9px] tracking-[0.38em] uppercase"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {card.destination.country}
        </p>

        {/* City name — very large */}
        <h2
          className="text-white"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(44px, 7vw, 80px)",
            fontWeight: 300,
            fontStyle: "italic",
            lineHeight: 0.88,
          }}
        >
          {card.destination.city}
        </h2>

        {/* Bottom data strip */}
        <div>
          {/* Flight + cost on same row */}
          <div className="flex items-center gap-3 flex-wrap mb-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className="text-white/60 text-[11px] font-semibold"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                {outbound.from}
              </span>
              <span className="text-white/22 text-[10px]">✈</span>
              <span
                className="text-white/60 text-[11px] font-semibold"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                {outbound.to}
              </span>
              <span
                className="text-white/28 text-[9px]"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                · {outbound.duration}
              </span>
            </div>
            <div
              className="flex items-baseline gap-1 bg-black/55 backdrop-blur-sm rounded-full px-3 py-1 border border-white/8"
            >
              <span
                className="text-white/28 text-[8px] tracking-[0.15em]"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                from
              </span>
              <span
                className="text-white text-[16px] font-bold leading-none"
                style={{
                  fontFamily: "var(--font-syne)",
                  letterSpacing: "-0.025em",
                }}
              >
                £{card.cost.total}
              </span>
            </div>
          </div>

          {/* Weather + times */}
          <div
            className="flex items-center gap-2 text-white/28 text-[9px]"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            <WeatherIcon icon={card.weather.icon} size={10} color="rgba(255,255,255,0.28)" />
            <span>{card.weather.avgTempC}°C · {card.weather.summary}</span>
            <span className="text-white/12">·</span>
            <span>
              {outbound.departureTime} → {outbound.arrivalTime}
            </span>
          </div>
        </div>
      </div>

      {/* Polaroid accents — bottom-right */}
      <div className="absolute bottom-4 right-5 flex gap-2 items-end">
        {card.images.collage.slice(0, 2).map((url, i) => (
          <div
            key={i}
            className="overflow-hidden"
            style={{
              width: i === 0 ? 54 : 44,
              height: i === 0 ? 54 : 44,
              border: `${i === 0 ? "5px" : "4px"} solid rgba(255,255,255,0.75)`,
              borderRadius: "1px",
              transform: i === 0 ? "rotate(-4deg)" : "rotate(5deg)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Expand chevron — right-center */}
      <div className="absolute right-5 top-1/2 -translate-y-1/2">
        <svg
          className="text-white/18 group-hover:text-white/50 transition-colors duration-300"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 16 16"
        >
          <path
            d="M3 8h10M8.5 3.5L13 8l-4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
