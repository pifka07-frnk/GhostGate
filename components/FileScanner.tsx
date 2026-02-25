"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SCAN_PATHS = [
  "/storage/emulated/0/DCIM/",
  "/storage/emulated/0/Download/",
  "/storage/emulated/0/Android/data/",
  "/data/data/com.whatsapp/",
  "/storage/emulated/0/Pictures/",
  "/storage/emulated/0/Documents/",
  "/data/user/0/com.android.providers.contacts/",
  "/storage/emulated/0/DCIM/Camera/",
  "/data/data/com.google.android.gms/",
  "/storage/emulated/0/Android/obb/",
  "/system/app/",
  "/data/local/tmp/",
  "/storage/emulated/0/WhatsApp/Media/",
  "/data/data/com.android.providers.telephony/",
];

const TICK_MS = 180;
const DURATION_MS = 3500;

export type FileScannerProps = {
  active: boolean;
  onComplete?: () => void;
};

export default function FileScanner({ active, onComplete }: FileScannerProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    if (!active) {
      setCurrentIndex(-1);
      return;
    }
    setCurrentIndex(0);
    const interval = setInterval(() => {
      setCurrentIndex((i) => {
        const next = i + 1;
        if (next >= SCAN_PATHS.length) return i;
        return next;
      });
    }, TICK_MS);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      onComplete?.();
    }, DURATION_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="rounded-xl border border-ghost-neon/40 bg-ghost-black/90 overflow-hidden">
      <div className="px-2 py-1.5 border-b border-ghost-border/50 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-ghost-neon animate-pulse" />
        <span className="text-[10px] uppercase tracking-wider text-ghost-neon font-mono">
          Filesystem intercept
        </span>
      </div>
      <div className="p-2 min-h-[120px] max-h-[160px] overflow-hidden font-mono text-[11px] text-ghost-neon/95 leading-relaxed">
        <AnimatePresence mode="popLayout">
          {SCAN_PATHS.slice(0, currentIndex + 1).map((path, i) => (
            <motion.div
              key={`${path}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0.3 }}
              transition={{ duration: 0.12 }}
              className="truncate"
              style={{ textShadow: "0 0 8px rgba(0,255,136,0.5)" }}
            >
              {path}
            </motion.div>
          ))}
        </AnimatePresence>
        {active && currentIndex >= 0 && (
          <motion.div
            className="inline-block w-2 h-3 bg-ghost-neon/90 ml-0.5 animate-pulse"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
