import type { DestinationCard as DestinationCardType } from "@/lib/types";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  card: DestinationCardType;
  onClick?: () => void;
}

// The locked direction — A×C Hybrid
// A's dark full-bleed photography + C's polaroid collage overlays
// Flight timeline replaces highlight bullets · Cormorant italic headline · Syne body
export function DestinationCard({ card, onClick }: Props) {
  const { outbound } = card.flightInfo;

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

      {/* Gradient — heavy bottom, whisper top */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 via-55% to-black/15" />

      {/* Polaroid collage — upper-right, partially off-edge */}
      <div className="absolute" style={{ top: "10%", right: "-6%", width: "52%" }}>
        {/* Back photo — tilted left */}
        {card.images.collage[1] && (
          <div
            className="absolute overflow-hidden"
            style={{
              top: "28px",
              left: "8px",
              width: "70%",
              aspectRatio: "1",
              border: "6px solid white",
              boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
              transform: "rotate(-7deg)",
              borderRadius: "1px",
              zIndex: 1,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.images.collage[1]}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {/* Front photo — tilted right, overlapping */}
        {card.images.collage[0] && (
          <div
            className="absolute overflow-hidden"
            style={{
              top: 0,
              right: "8px",
              width: "76%",
              aspectRatio: "1",
              border: "7px solid white",
              boxShadow: "0 10px 36px rgba(0,0,0,0.50)",
              transform: "rotate(5deg)",
              borderRadius: "1px",
              zIndex: 2,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.images.collage[0]}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {/* Spacer so the div has height */}
        <div style={{ paddingTop: "110%" }} />
      </div>

      {/* Cost pill — top-left, dark backdrop always legible */}
      <div className="absolute top-5 left-5">
        <div
          className="flex items-baseline gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/10"
        >
          <span
            className="text-white/35 text-[8px] tracking-[0.18em] uppercase"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            from
          </span>
          <span
            className="text-white text-[18px] font-bold leading-none"
            style={{
              fontFamily: "var(--font-syne)",
              letterSpacing: "-0.025em",
            }}
          >
            £{card.cost.total}
          </span>
        </div>
      </div>

      {/* Bottom text zone */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
        {/* Country */}
        <p
          className="text-white/30 text-[9px] tracking-[0.32em] uppercase mb-0.5"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {card.destination.country}
        </p>

        {/* City name */}
        <h2
          className="text-white leading-[0.88] mb-4"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(44px, 8.5vw, 58px)",
            fontWeight: 300,
            fontStyle: "italic",
          }}
        >
          {card.destination.city}
        </h2>

        {/* Flight timeline */}
        <div
          className="pt-3 mb-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}
        >
          {/* Route line */}
          <div className="flex items-center justify-between mb-1.5">
            <span
              className="text-white/75 text-[12px] font-semibold"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {outbound.from}
            </span>

            <div className="flex-1 flex items-center mx-2.5">
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(255,255,255,0.18)" }}
              />
              <span
                className="mx-1.5 text-white/35"
                style={{ fontSize: "11px" }}
              >
                ✈
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(255,255,255,0.18)" }}
              />
            </div>

            <span
              className="text-white/75 text-[12px] font-semibold"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {outbound.to}
            </span>
          </div>

          {/* Times + duration */}
          <div className="flex items-center justify-between">
            <span
              className="text-white/38 text-[10px]"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {outbound.departureTime}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="text-white/22 text-[9px] tracking-[0.06em]"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                {outbound.duration}
              </span>
              <span className="text-white/15 text-[8px]">·</span>
              <div className="flex items-center gap-1">
                <WeatherIcon
                  icon={card.weather.icon}
                  size={11}
                  color="rgba(255,255,255,0.28)"
                />
                <span
                  className="text-white/22 text-[9px]"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  {card.weather.avgTempC}°
                </span>
              </div>
            </div>
            <span
              className="text-white/38 text-[10px]"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {outbound.arrivalTime}
            </span>
          </div>
        </div>

        {/* Expand chevron */}
        <div className="flex justify-center">
          <svg
            className="text-white/22 group-hover:text-white/55 group-hover:translate-y-0.5 transition-all duration-300"
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
  );
}
