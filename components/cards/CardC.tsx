import type { DestinationCard } from "@/lib/types";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  card: DestinationCard;
  onClick?: () => void;
}

// Variant C — "The Postcard"
// Warm cream card. Photos layered like prints on a desk — polaroid overlaps.
// Fraunces + DM Mono. Amber cost tag. Tactile and personal.
export function CardC({ card, onClick }: Props) {
  return (
    <div
      className="relative cursor-pointer group select-none"
      style={{
        aspectRatio: "3 / 4",
        background: "#fdf8f0",
        borderRadius: "20px",
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
      onClick={onClick}
    >
      {/* Main photo — printed/framed feel */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: "4%",
          left: "6%",
          right: "30%",
          bottom: "46%",
          border: "8px solid white",
          boxShadow: "0 4px 18px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)",
          borderRadius: "2px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.images.hero}
          alt={card.destination.city}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Collage photo 1 — overlapping, rotated clockwise */}
      {card.images.collage[0] && (
        <div
          className="absolute overflow-hidden"
          style={{
            top: "18%",
            right: "4%",
            width: "34%",
            aspectRatio: "1",
            border: "7px solid white",
            boxShadow: "0 5px 16px rgba(0,0,0,0.16)",
            transform: "rotate(6deg)",
            borderRadius: "2px",
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

      {/* Collage photo 2 — slightly smaller, rotated counter-clockwise */}
      {card.images.collage[1] && (
        <div
          className="absolute overflow-hidden"
          style={{
            top: "33%",
            right: "18%",
            width: "26%",
            aspectRatio: "1",
            border: "6px solid white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            transform: "rotate(-4deg)",
            borderRadius: "2px",
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

      {/* Text zone */}
      <div
        className="absolute bottom-0 left-0 right-0 px-5 pb-5"
        style={{ top: "55%" }}
      >
        <p
          className="text-[10px] tracking-[0.22em] uppercase mb-0.5"
          style={{ fontFamily: "var(--font-dm-mono)", color: "#a08060" }}
        >
          {card.destination.country}
        </p>

        <h2
          className="leading-[0.88] mb-3"
          style={{
            fontFamily: "var(--font-fraunces)",
            fontSize: "clamp(36px, 7vw, 50px)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "#1a1208",
          }}
        >
          {card.destination.city}
        </h2>

        {/* Cost + weather badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="text-[11px] font-medium px-2.5 py-1 rounded-full"
            style={{
              fontFamily: "var(--font-dm-mono)",
              background: "#e8b84b",
              color: "#3a2500",
            }}
          >
            £{card.cost.total}
          </span>
          <span
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full"
            style={{
              fontFamily: "var(--font-dm-mono)",
              background: "white",
              color: "#5a4830",
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            }}
          >
            <WeatherIcon
              icon={card.weather.icon}
              size={11}
              color="#5a4830"
            />
            <span style={{ marginLeft: 3 }}>{card.weather.avgTempC}°C</span>
          </span>
        </div>

        {/* Highlights */}
        <div
          className="pt-2.5"
          style={{ borderTop: "1px solid #d8c8a8" }}
        >
          <ul className="space-y-1.5">
            {card.highlights.slice(0, 3).map((h, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[10px] leading-snug"
                style={{ fontFamily: "var(--font-dm-mono)", color: "#6b5540" }}
              >
                <span style={{ color: "#c4a870", marginTop: 1, flexShrink: 0 }}>
                  ·
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-end mt-3">
            <svg
              className="group-hover:translate-y-0.5 transition-transform duration-300"
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                d="M7 2.5v9M3 7.5l4 4.5 4-4.5"
                stroke="#c4a870"
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
