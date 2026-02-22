"use client";

import { Ghost } from "lucide-react";

const LOCATIONS = [
  { x: "15%", y: "35%", label: "Berlin" },
  { x: "48%", y: "28%", label: "Tokyo" },
  { x: "52%", y: "55%", label: "Sydney" },
  { x: "22%", y: "52%", label: "Lagos" },
  { x: "75%", y: "38%", label: "LA" },
];

export default function WorldMapMockup() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-6 md:p-8 relative min-h-[320px] md:min-h-[380px] flex items-center justify-center">
          {/* Simplified world map: continent shapes */}
          <div
            className="absolute inset-4 md:inset-6 rounded-xl bg-ghost-anthracite/80 border border-ghost-border overflow-hidden"
            aria-hidden
          >
            <svg
              viewBox="0 0 400 200"
              className="w-full h-full opacity-30"
              fill="currentColor"
            >
              <path
                d="M80 60 Q120 40 160 55 L180 80 L160 100 L120 95 L80 80 Z"
                className="text-ghost-neon"
              />
              <path
                d="M200 50 L280 45 L300 70 L280 95 L220 90 L200 70 Z"
                className="text-ghost-neon"
              />
              <path
                d="M50 120 L120 110 L150 140 L130 170 L80 165 L50 140 Z"
                className="text-ghost-neon"
              />
              <path
                d="M250 120 L320 115 L350 145 L330 175 L260 170 L250 140 Z"
                className="text-ghost-neon"
              />
              <path
                d="M300 80 L360 75 L380 100 L360 125 L310 120 Z"
                className="text-ghost-neon"
              />
            </svg>
          </div>

          {/* Location dots */}
          {LOCATIONS.map((loc) => (
            <div
              key={loc.label}
              className="absolute w-2 h-2 rounded-full bg-ghost-neon/60 shadow-neon-sm"
              style={{ left: loc.x, top: loc.y }}
              aria-hidden
            />
          ))}

          {/* Ghost icon – hops between locations */}
          <div
            className="absolute animate-ghost-hop flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-ghost-neon/20 border border-ghost-neon/50 shadow-neon -translate-x-1/2 -translate-y-1/2"
            style={{ left: "15%", top: "35%" }}
            aria-hidden
          >
            <Ghost className="w-5 h-5 md:w-6 md:h-6 text-ghost-neon" strokeWidth={2} />
          </div>

          <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-zinc-500">
            Dein digitaler Geist springt – Tracker sehen nur Rauschen.
          </p>
        </div>
      </div>
    </section>
  );
}
