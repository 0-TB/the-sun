"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DestinationCard as DestinationCardType } from "@/lib/types";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  card: DestinationCardType;
  onClick?: () => void;
}

// The locked direction — A×C Hybrid, v2
// Fade carousel replaces polaroid cluster · Prominent weather badge · Refined cost typography
export function DestinationCard({ card, onClick }: Props) {
  const { outbound } = card.flightInfo;

  // All images for this destination: hero first, then collage
  const images = [card.images.hero, ...card.images.collage].filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);

  const advance = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  // Auto-cycle every 8 seconds, with a random initial offset so multiple
  // cards on screen don't all transition at the same moment.
  useEffect(() => {
    if (images.length <= 1) return;
    const offset = Math.random() * 8000;
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      advance();
      interval = setInterval(advance, 8000);
    }, offset);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [advance, images.length]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer select-none group"
      style={{ aspectRatio: "3 / 4" }}
      onClick={onClick}
    >
      {/* ── Carousel — full-bleed crossfade ──────────────────────────────── */}
      <AnimatePresence mode="sync">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={card.destination.city}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Hover scale wrapper — inside overflow:hidden so card shape is preserved */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 pointer-events-none" />

      {/* ── Tap-to-advance zone — upper 58% ──────────────────────────────── */}
      {/* Stops propagation so clicking image advances carousel, not opens modal */}
      {images.length > 1 && (
        <div
          className="absolute inset-x-0 top-0 z-20"
          style={{ height: "58%" }}
          onClick={(e) => {
            e.stopPropagation();
            advance();
          }}
        />
      )}

      {/* ── Gradient — heavy bottom, whisper top ─────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 via-55% to-black/15 pointer-events-none" />

      {/* ── Dot indicators — top centre ──────────────────────────────────── */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30 pointer-events-none">
          {images.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === currentIndex ? "14px" : "5px",
                height: "5px",
                background:
                  i === currentIndex
                    ? "rgba(255,255,255,0.80)"
                    : "rgba(255,255,255,0.28)",
              }}
            />
          ))}
        </div>
      )}

      {/* ── Cost pill — top-left ─────────────────────────────────────────── */}
      {/* z-30 so it sits above tap zone; stopPropagation so it doesn't open modal */}
      <div
        className="absolute top-5 left-5 z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline gap-1 bg-black/55 backdrop-blur-md rounded-full px-3.5 py-2 border border-white/10">
          <span
            className="text-white/35 text-[8px] tracking-[0.18em] uppercase"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            from
          </span>
          {/* Cormorant italic for the price — matches city name, feels editorial not price-tag */}
          <span
            className="text-white leading-none"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "21px",
              fontWeight: 400,
              fontStyle: "italic",
              letterSpacing: "-0.01em",
            }}
          >
            £{card.cost.total}
          </span>
        </div>
      </div>

      {/* ── Weather badge — top-right ────────────────────────────────────── */}
      {/* Elevated from footnote to at-a-glance feature */}
      <div
        className="absolute top-5 right-5 z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-1 bg-black/55 backdrop-blur-md rounded-xl px-3 py-2.5 border border-white/10">
          <WeatherIcon
            icon={card.weather.icon}
            size={22}
            color="rgba(255,255,255,0.88)"
          />
          <span
            className="text-white/90 leading-none"
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "17px",
              fontWeight: 300,
            }}
          >
            {card.weather.avgTempC}°
          </span>
          <span
            className="text-white/32 text-center leading-tight"
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: "6.5px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              maxWidth: "52px",
            }}
          >
            {card.weather.summary}
          </span>
        </div>
      </div>

      {/* ── Bottom text zone — click here opens modal ────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-30">
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
            <span
              className="text-white/22 text-[9px] tracking-[0.06em]"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              {outbound.duration}
            </span>
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
