"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const VIEWBOX = { w: 800, h: 400 };

const WORLD_PATHS = [
  "M 180 80 L 320 60 L 380 120 L 360 200 L 280 220 L 200 180 Z",
  "M 220 200 L 340 220 L 380 280 L 320 340 L 200 320 L 180 260 Z",
  "M 400 40 L 580 50 L 680 100 L 720 180 L 660 220 L 520 200 L 420 140 Z",
  "M 480 220 L 620 240 L 680 300 L 600 360 L 460 340 Z",
  "M 80 60 L 160 40 L 220 80 L 240 160 L 180 200 L 100 180 Z",
  "M 120 200 L 220 220 L 280 280 L 240 340 L 140 320 Z",
  "M 240 260 L 300 280 L 320 360 L 260 380 L 220 320 Z",
  "M 580 280 L 680 260 L 720 320 L 680 360 L 580 340 Z",
];

const COUNTRIES = ["USA", "China", "Russia", "Germany"] as const;
type CountryKey = (typeof COUNTRIES)[number];

type Ping = { id: string; x: number; y: number; ip: string; country: CountryKey };

function randomPingPosition(): { x: number; y: number } {
  return {
    x: 12 + Math.random() * 76,
    y: 15 + Math.random() * 70,
  };
}

function randomCountry(): CountryKey {
  return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
}

/** Fake-IP für Anzeige (z.B. 185.23.xx.xx) */
function randomDisplayIP(): string {
  const o = () => Math.floor(Math.random() * 256);
  return `185.23.${o()}.${o()}`;
}

const THREAT_LOG_DESCRIPTIONS = [
  "Tracker-Anfrage abgewiesen",
  "Unbekannte Quelle blockiert",
  "Ad-Netzwerk blockiert",
  "Analytics-Ping verworfen",
  "Cloud-Tracker blockiert",
  "Interne Abfrage verschleiert",
];

function randomIP(): string {
  const o = () => Math.floor(Math.random() * 256);
  const variant = Math.random();
  if (variant < 0.33) return `192.168.${o()}.${o()}`;
  if (variant < 0.66) return `10.0.${o()}.${o()}`;
  return `${o()}.${o()}.${o()}.${o()}`;
}

function randomThreatLog(ip: string) {
  return {
    title: `Blocked request from IP ${ip}`,
    description: THREAT_LOG_DESCRIPTIONS[Math.floor(Math.random() * THREAT_LOG_DESCRIPTIONS.length)],
  };
}

export type ThreatMapProps = {
  onPing?: (entry: { title: string; description: string }) => void;
};

const MAX_BAR = 100;

export default function ThreatMap({ onPing }: ThreatMapProps) {
  const [pings, setPings] = useState<Ping[]>([]);
  const [countryCounts, setCountryCounts] = useState<Record<CountryKey, number>>(() =>
    COUNTRIES.reduce((acc, c) => ({ ...acc, [c]: 0 }), {} as Record<CountryKey, number>)
  );
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function addPing() {
      const { x, y } = randomPingPosition();
      const country = randomCountry();
      const ip = randomDisplayIP();
      const id = `ping-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setPings((prev) => [...prev.slice(-14), { id, x, y, ip, country }]);
      setCountryCounts((prev) => ({ ...prev, [country]: prev[country] + 1 }));
      onPing?.(randomThreatLog(ip));

      setTimeout(() => {
        setPings((prev) => prev.filter((p) => p.id !== id));
      }, 1400);
    }

    function scheduleNext() {
      const delay = 2000 + Math.random() * 2000;
      timeoutRef.current = window.setTimeout(() => {
        addPing();
        scheduleNext();
      }, delay);
    }
    scheduleNext();
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [onPing]);

  const maxCount = Math.max(1, ...Object.values(countryCounts));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-4 w-full">
      {/* Karte */}
      <div className="relative w-full overflow-hidden rounded-xl border border-ghost-border bg-ghost-anthracite/80 aspect-[2/1] min-w-0">
        <svg
          viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
          className="w-full h-full block"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="threat-map-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(39 39 42)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(24 24 27)" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {WORLD_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="url(#threat-map-fill)"
              stroke="rgb(113 113 122)"
              strokeWidth="1.2"
              className="text-zinc-600"
            />
          ))}
        </svg>

        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {pings.map(({ id, x, y, ip }) => (
              <motion.div
                key={id}
                className="absolute flex flex-col items-center"
                style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {/* IP-Pop-up über dem Ping – kurz anzeigen, dann ausblenden */}
                <motion.div
                  className="absolute bottom-full mb-1 px-2 py-1 rounded bg-ghost-black/95 border border-ghost-neon/50 text-ghost-neon font-mono text-[10px] whitespace-nowrap shadow-neon-sm"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: [0, 1, 1, 0], y: [4, 0, 0, 0] }}
                  transition={{ times: [0, 0.15, 0.7, 1], duration: 1.2 }}
                >
                  {ip}
                </motion.div>
                <motion.div
                  className="w-3 h-3 rounded-full bg-ghost-neon shadow-[0_0_12px_rgba(0,255,136,0.8)]"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2.8, opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Top Threat Origins */}
      <div className="flex flex-col gap-3 lg:min-w-0">
        <p className="text-xs uppercase tracking-wide text-zinc-500 font-medium">Top Threat Origins</p>
        {COUNTRIES.map((country) => {
          const count = countryCounts[country];
          const pct = Math.min(MAX_BAR, (count / maxCount) * 100);
          return (
            <div key={country} className="flex flex-col gap-1">
              <span className="text-xs text-zinc-400">{country}</span>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden border border-ghost-border/50 relative">
                <motion.div
                  className="h-full rounded-full bg-ghost-neon relative z-10"
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                  style={{ maxWidth: "100%", boxShadow: "0 0 10px rgba(0,255,136,0.5)" }}
                />
                {/* Puls bei jeder Änderung */}
                <motion.div
                  key={`${country}-${count}`}
                  className="absolute inset-0 rounded-full bg-ghost-neon pointer-events-none z-0"
                  initial={{ opacity: 0.9, boxShadow: "0 0 18px rgba(0,255,136,0.9)" }}
                  animate={{ opacity: 0, boxShadow: "0 0 6px rgba(0,255,136,0.3)" }}
                  transition={{ duration: 0.5 }}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
