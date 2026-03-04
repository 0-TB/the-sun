import type { DestinationCard } from "@/lib/types";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  card: DestinationCard;
  onClick?: () => void;
}

// Variant B — "The Broadsheet"
// Landscape split: full-bleed image left, pitch-black editorial panel right.
// Cost is the visual anchor. Information is numbered, not bulleted.
// Playfair Display + Syne.
export function CardB({ card, onClick }: Props) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer group flex select-none"
      style={{ aspectRatio: "3 / 2" }}
      onClick={onClick}
    >
      {/* Left: Hero image */}
      <div className="relative overflow-hidden" style={{ width: "54%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.images.hero}
          alt={card.destination.city}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Film-strip collage — bottom-left */}
        <div className="absolute bottom-4 left-4 flex gap-1.5">
          {card.images.collage.slice(0, 2).map((url, i) => (
            <div
              key={i}
              className="overflow-hidden border border-white/50"
              style={{ width: 48, height: 48, borderRadius: "1px" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Right: Editorial panel */}
      <div
        className="flex-1 flex flex-col justify-between px-5 py-4"
        style={{ background: "#070707" }}
      >
        {/* Vibe tags */}
        <div className="flex flex-wrap gap-1.5">
          {card.vibes.map((v) => (
            <span
              key={v}
              className="text-[8px] tracking-[0.2em] uppercase text-white/20 border border-white/8 rounded-full px-2 py-0.5"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {v}
            </span>
          ))}
        </div>

        {/* City + country */}
        <div>
          <h2
            className="text-white leading-[0.85] mb-1"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(26px, 3.2vw, 42px)",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            {card.destination.city}
          </h2>
          <p
            className="text-white/20 text-[8px] tracking-[0.32em] uppercase mb-3"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            {card.destination.country}
          </p>

          {/* Cost — large anchor */}
          <div className="mb-3">
            <span
              className="leading-none block"
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: "clamp(22px, 2.8vw, 34px)",
                fontWeight: 800,
                color: "#e8d8b0",
                letterSpacing: "-0.025em",
              }}
            >
              £{card.cost.total}
            </span>
            <span
              className="text-white/20 text-[8px] tracking-[0.12em]"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              per person · flights + hotel
            </span>
          </div>

          {/* Divider */}
          <div
            className="mb-2.5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          />

          {/* Weather */}
          <div
            className="flex items-center gap-1.5 text-white/30 text-[9px] mb-2.5"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            <WeatherIcon icon={card.weather.icon} size={11} />
            <span>
              {card.weather.avgTempC}°C · {card.weather.summary}
            </span>
          </div>

          {/* Numbered highlights */}
          <ol className="space-y-1">
            {card.highlights.slice(0, 3).map((h, i) => (
              <li
                key={i}
                className="flex gap-2 text-white/35 text-[9px] leading-snug"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                <span
                  className="text-white/15 shrink-0 font-semibold"
                  style={{ minWidth: "14px" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Chevron — rightward, indicating expand */}
        <div className="flex justify-end">
          <svg
            className="text-white/18 group-hover:text-white/50 transition-colors duration-300"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              d="M3 8h10M8.5 3.5l4.5 4.5-4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
