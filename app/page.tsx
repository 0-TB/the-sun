"use client";

import { useState, useEffect } from "react";
import type { DestinationCard } from "@/lib/types";
import { DestinationCard as DestinationCardComponent } from "@/components/cards/DestinationCard";
import { DestinationCardStrip } from "@/components/cards/DestinationCardStrip";
import { DestinationCardWide } from "@/components/cards/DestinationCardWide";

export default function Home() {
  const [cards, setCards] = useState<DestinationCard[]>([]);

  useEffect(() => {
    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
      .then((r) => r.json())
      .then((data) => setCards(data.destinations));
  }, []);

  if (cards.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#080808" }}
      >
        <div
          className="text-white/12 text-[9px] tracking-[0.5em] uppercase"
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
      {/* ── Header ──────────────────────────────────────── */}
      <div className="mb-14 max-w-6xl mx-auto">
        <div
          className="text-white/12 text-[9px] tracking-[0.5em] uppercase mb-4"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Helios · Design Exploration
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
          className="text-white/22 text-[11px]"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          hēlios · your weekend, curated
        </p>
      </div>

      {/* ── Section 1: The locked direction ─────────────── */}
      <div className="max-w-6xl mx-auto mb-20">
        <SectionLabel label="A×C Hybrid" note="Locked direction — all three destinations" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((card) => (
            <DestinationCardComponent key={card.id} card={card} />
          ))}
        </div>
      </div>

      {/* ── Section 2: Alternative — Horizontal strip ───── */}
      <div className="max-w-6xl mx-auto mb-16">
        <SectionLabel label="Alt — Horizontal Strip" note="List format · compact · price anchors right" />
        <div className="flex flex-col gap-3">
          {cards.map((card) => (
            <DestinationCardStrip key={card.id} card={card} />
          ))}
        </div>
      </div>

      {/* ── Section 3: Alternative — Wide cinematic ─────── */}
      <div className="max-w-6xl mx-auto mb-16">
        <SectionLabel label="Alt — Wide Cinematic" note="Billboard scale · city name and photo share equal billing" />
        <div className="flex flex-col gap-5">
          {cards.map((card) => (
            <DestinationCardWide key={card.id} card={card} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto">
        <div
          className="text-white/10 text-[8px] tracking-[0.4em] uppercase"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Next: Framer Motion · plane animation · staggered entrance · carousel
        </div>
      </div>
    </main>
  );
}

function SectionLabel({ label, note }: { label: string; note: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-baseline gap-3">
        <span
          className="text-white/50 text-[11px] font-semibold tracking-[0.12em] uppercase"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {label}
        </span>
        <span
          className="text-white/18 text-[10px]"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {note}
        </span>
      </div>
      <div
        className="mt-2 h-px"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
    </div>
  );
}
