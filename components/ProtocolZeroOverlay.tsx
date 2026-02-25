"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const COUNTDOWN_SECONDS = 5;

function playSystemShutdownSound(): void {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  try {
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 1.2);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch {
    /* ignore */
  }
}

export type ProtocolZeroOverlayProps = {
  active: boolean;
  onComplete: () => void;
};

export default function ProtocolZeroOverlay({ active, onComplete }: ProtocolZeroOverlayProps) {
  const [count, setCount] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!active) return;
    setCount(COUNTDOWN_SECONDS);
    const interval = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    if (!active || count !== 0) return;
    playSystemShutdownSound();
    onComplete();
  }, [active, count, onComplete]);

  if (!active) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[11000] flex flex-col items-center justify-center bg-red-950/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="text-center px-4"
        animate={{ scale: [1, 1.02, 1], opacity: [0.95, 1, 0.95] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-red-400/90 text-xs uppercase tracking-[0.3em] mb-2 font-semibold">
          Protocol Zero — Finale Zerstörung
        </p>
        <p className="text-white text-4xl sm:text-6xl font-black tabular-nums text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]">
          {count}
        </p>
        <p className="text-red-300/80 text-sm mt-4 max-w-xs mx-auto">
          Alle lokalen Daten werden unwiderruflich gelöscht.
        </p>
      </motion.div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(239,68,68,0.15)_100%)]" />
        <motion.div
          className="absolute inset-0 border-4 border-red-500/50"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}
