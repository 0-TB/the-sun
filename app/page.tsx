"use client";

import { useState, useEffect } from "react";
import type { DestinationCard } from "@/lib/types";
import { CardA } from "@/components/cards/CardA";
import { CardB } from "@/components/cards/CardB";
import { CardC } from "@/components/cards/CardC";

const VARIANTS = [
  {
    id: "A",
    name: "The Cover",
    tagline: "Editorial. Image-led. Sparse typography over full-bleed photography.",
  },
  {
    id: "B",
    name: "The Broadsheet",
    tagline: "Structured. Split layout. Dark panel surfaces cost and hierarchy.",
  },
  {
    id: "C",
    name: "The Postcard",
    tagline: "Warm. Tactile. Layered prints on a cream card — made to be kept.",
  },
];

export default function Home() {
  const [card, setCard] = useState<DestinationCard | null>(null);

  useEffect(() => {
    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((r) => r.json())
      .then((data) => setCard(data.destinations[0]));
  }, []);

  if (!card) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#080808" }}
      >
        <div
          className="text-white/15 text-[10px] tracking-[0.4em] uppercase"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Loading
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen px-6 py-14 md:px-12 lg:px-16"
      style={{ background: "#080808" }}
    >
      {/* Header */}
      <div className="mb-14 max-w-6xl mx-auto">
        <div
          className="text-white/15 text-[9px] tracking-[0.5em] uppercase mb-4"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Step 3 · Design Exploration
        </div>
        <h1
          className="text-white mb-2"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(36px, 5vw, 52px)",
            fontWeight: 300,
            fontStyle: "italic",
            lineHeight: 1,
          }}
        >
          Helios
        </h1>
        <p
          className="text-white/25 text-[12px]"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Three card directions · all showing Lisbon · pick one to build with
        </p>
      </div>

      {/* 3-column variant grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 items-start">
        {VARIANTS.map(({ id, name, tagline }, i) => (
          <div key={id} className="flex flex-col gap-5">
            {/* Variant label */}
            <div className="flex items-start gap-3">
              <span
                className="text-white/8 font-bold leading-none"
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "clamp(52px, 5vw, 64px)",
                  lineHeight: 0.9,
                }}
              >
                {id}
              </span>
              <div className="pt-1">
                <div
                  className="text-white/60 text-[13px] font-semibold leading-none mb-1"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  {name}
                </div>
                <div
                  className="text-white/22 text-[10px] leading-snug max-w-[180px]"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  {tagline}
                </div>
              </div>
            </div>

            {/* Card variant */}
            {i === 0 && <CardA card={card} />}
            {i === 1 && <CardB card={card} />}
            {i === 2 && <CardC card={card} />}
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="max-w-6xl mx-auto mt-16">
        <div
          className="text-white/12 text-[9px] tracking-[0.35em] uppercase"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Once a direction is chosen · all three destinations will be rendered
        </div>
      </div>
    </main>
  );
}
