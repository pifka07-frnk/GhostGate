"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Fingerprint } from "lucide-react";

const SESSION_KEY = "ghostgate_biometric_passed";
const SCAN_DURATION_MS = 2200;

function triggerHaptic(): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  } catch {
    /* ignore */
  }
}

function playAccessGrantedSound(): void {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  try {
    const ctx = new Ctx();
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.start(start);
      osc.stop(start + duration);
    };
    playTone(523.25, 0, 0.18);
    playTone(659.25, 0.12, 0.2);
    playTone(783.99, 0.28, 0.25);
  } catch {
    /* ignore */
  }
}

export type BiometricAccessOverlayProps = {
  onComplete: () => void;
  /** Nach Protocol Zero: Scan führt nicht mehr zum Entsperren, bis die Seite neu geladen wird */
  locked?: boolean;
};

export default function BiometricAccessOverlay({ onComplete, locked = false }: BiometricAccessOverlayProps) {
  const [scanning, setScanning] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showDeniedMessage, setShowDeniedMessage] = useState(false);
  const scanDoneRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const startScan = useCallback(() => {
    if (locked) {
      setShowDeniedMessage(true);
      setTimeout(() => setShowDeniedMessage(false), 3000);
      return;
    }
    if (scanning || scanDoneRef.current) return;
    triggerHaptic();
    setScanning(true);
    scanDoneRef.current = true;

    const t = setTimeout(() => {
      playAccessGrantedSound();
      setExiting(true);
    }, SCAN_DURATION_MS);
    return () => clearTimeout(t);
  }, [scanning, locked, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-ghost-black"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
      }}
      initial={false}
      animate={
        exiting
          ? { opacity: 0, y: "-100%" }
          : { opacity: 1, y: 0 }
      }
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      onAnimationComplete={() => {
        if (exiting) onComplete();
      }}
    >
      <button
        type="button"
        onClick={startScan}
        onTouchStart={(e) => {
          e.preventDefault();
          startScan();
        }}
        className="flex flex-col items-center justify-center gap-6 p-8 focus:outline-none focus:ring-2 focus:ring-ghost-neon/50 rounded-3xl touch-manipulation"
        aria-label="Biometrie scannen"
      >
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
          <motion.div
            className="text-ghost-neon absolute inset-0 flex items-center justify-center"
            animate={scanning ? {} : { scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Fingerprint
              className="w-full h-full drop-shadow-[0_0_24px_rgba(0,255,136,0.6)]"
              strokeWidth={1.2}
            />
          </motion.div>

          {/* Horizontale Scan-Linie über dem Icon */}
          <AnimatePresence>
            {scanning && (
              <motion.div
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-ghost-neon shadow-[0_0_16px_rgba(0,255,136,0.9)]"
                  initial={{ top: "-5%" }}
                  animate={{ top: "105%" }}
                  transition={{
                    duration: SCAN_DURATION_MS / 1000,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-sm sm:text-base text-zinc-500 font-medium min-h-[1.5em]">
          {locked ? "Protocol Zero aktiv – Zugriff gesperrt" : scanning ? "Scanning Identity…" : "Berühren zum Scannen"}
        </p>
        {locked && showDeniedMessage && (
          <p className="text-red-400 text-xs font-medium mt-2 animate-pulse">
            Zugriff verweigert. Bitte Seite neu laden.
          </p>
        )}
      </button>
    </motion.div>
  );
}

export { SESSION_KEY };
