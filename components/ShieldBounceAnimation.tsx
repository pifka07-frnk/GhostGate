"use client";

import { motion } from "framer-motion";
import { Ghost, Shield, Crosshair, Eye, ScanLine } from "lucide-react";

const TRACKERS = [
  { Icon: Crosshair, from: { x: -80, y: 0 }, bounceTo: { x: -100, y: -25 }, delay: 0 },
  { Icon: Eye, from: { x: 80, y: 0 }, bounceTo: { x: 95, y: -20 }, delay: 0.4 },
  { Icon: ScanLine, from: { x: 0, y: -70 }, bounceTo: { x: -15, y: -95 }, delay: 0.8 },
  { Icon: Crosshair, from: { x: 0, y: 70 }, bounceTo: { x: 20, y: 90 }, delay: 1.2 },
  { Icon: Eye, from: { x: -60, y: -50 }, bounceTo: { x: -85, y: -70 }, delay: 1.6 },
  { Icon: ScanLine, from: { x: 65, y: 45 }, bounceTo: { x: 88, y: 60 }, delay: 2 },
];

const DURATION = 2.4;
const HIT_AT = 0.45; // Anteil der Animation, an dem "Treffer" passiert

export default function ShieldBounceAnimation() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 md:p-12 relative min-h-[280px] md:min-h-[320px] flex items-center justify-center overflow-hidden">
          {/* Ghost-Schild in der Mitte */}
          <motion.div
            className="absolute z-10 flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-ghost-neon/60 bg-ghost-neon/10 shadow-neon"
            initial={{ scale: 1 }}
            animate={{
              scale: [1, 1.02, 1],
              boxShadow: [
                "0 0 20px rgba(0, 255, 136, 0.3)",
                "0 0 35px rgba(0, 255, 136, 0.5)",
                "0 0 20px rgba(0, 255, 136, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          >
            <Shield className="absolute w-10 h-10 md:w-12 md:h-12 text-ghost-neon" strokeWidth={2} />
            <Ghost className="absolute w-6 h-6 md:w-7 md:h-7 text-ghost-neon mt-1" strokeWidth={2} />
          </motion.div>

          {/* Tracker-Icons: fliegen auf Schild zu, prallen ab */}
          {TRACKERS.map(({ Icon, from, bounceTo, delay }, i) => (
            <motion.div
              key={i}
              className="absolute w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-zinc-600/80 border border-zinc-500 text-zinc-400"
              initial={{ x: from.x, y: from.y, opacity: 0 }}
              animate={{
                x: [from.x, 0, bounceTo.x],
                y: [from.y, 0, bounceTo.y],
                opacity: [0, 1, 1],
                scale: [0.8, 1.15, 0.85],
                rotate: [0, 0, 12],
              }}
              transition={{
                duration: DURATION,
                delay: delay,
                repeat: Infinity,
                repeatDelay: 0.4,
                times: [0, HIT_AT, 1],
                ease: "easeInOut",
              }}
              aria-hidden
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
            </motion.div>
          ))}

          <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-zinc-500">
            Tracker prallen am Ghost-Schild ab – deine Daten bleiben geschützt.
          </p>
        </div>
      </div>
    </section>
  );
}
