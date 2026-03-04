import type { DestinationCard } from "@/lib/types";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  card: DestinationCard;
  onClick?: () => void;
}

// Alternative layout: Horizontal strip / list item
// Three-zone scan: photo → destination info → cost
// Compact but not cramped. Works well as a ranked list.
export function DestinationCardStrip({ card, onClick }: Props) {
  const { outbound } = card.flightInfo;

  return (
    <div
      className="flex overflow-hidden rounded-xl cursor-pointer group select-none"
      style={{
        height: "148px",
        background: "#0d0d0d",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
      onClick={onClick}
    >
      {/* Zone 1: Photo */}
      <div className="relative overflow-hidden flex-none" style={{ width: "28%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.images.hero}
          alt={card.destination.city}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Right-edge fade into dark panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/70" />
      </div>

      {/* Zone 2: Destination info */}
      <div
        className="flex-1 flex flex-col justify-center px-5 py-4"
        style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}
      >
        <p
          className="text-white/22 text-[8px] tracking-[0.32em] uppercase mb-0.5"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {card.destination.country}
        </p>
        <h3
          className="text-white leading-none mb-3"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(26px, 3.5vw, 34px)",
            fontWeight: 300,
            fontStyle: "italic",
          }}
        >
          {card.destination.city}
        </h3>

        {/* Flight — compact single line */}
        <div className="flex items-center gap-2">
          <span
            className="text-white/55 text-[10px] font-semibold"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            {outbound.from}
          </span>
          <div className="flex items-center gap-1">
            <div
              className="h-px w-6"
              style={{ background: "rgba(255,255,255,0.15)" }}
            />
            <span className="text-white/25 text-[9px]">✈</span>
            <div
              className="h-px w-6"
              style={{ background: "rgba(255,255,255,0.15)" }}
            />
          </div>
          <span
            className="text-white/55 text-[10px] font-semibold"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            {outbound.to}
          </span>
          <span
            className="text-white/22 text-[9px]"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            · {outbound.duration}
          </span>
        </div>

        {/* Depart + return times */}
        <div
          className="flex items-center gap-1.5 mt-1"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          <span className="text-white/22 text-[9px]">
            {outbound.departureTime}
          </span>
          <span className="text-white/12 text-[8px]">→</span>
          <span className="text-white/22 text-[9px]">
            {outbound.arrivalTime}
          </span>
        </div>
      </div>

      {/* Zone 3: Cost + weather + chevron */}
      <div
        className="flex flex-col items-end justify-between px-5 py-4 flex-none"
        style={{ width: "23%" }}
      >
        <div className="text-right">
          <span
            className="text-white text-[24px] font-bold leading-none block"
            style={{
              fontFamily: "var(--font-syne)",
              letterSpacing: "-0.03em",
            }}
          >
            £{card.cost.total}
          </span>
          <span
            className="text-white/20 text-[8px]"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            per person
          </span>
        </div>

        <div
          className="flex items-center gap-1 text-white/30 text-[9px]"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          <WeatherIcon icon={card.weather.icon} size={11} />
          <span>{card.weather.avgTempC}°C</span>
        </div>

        <svg
          className="text-white/15 group-hover:text-white/45 transition-colors duration-300"
          width="14"
          height="14"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            d="M3 7h8M6 3.5L10 7 6 10.5"
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
