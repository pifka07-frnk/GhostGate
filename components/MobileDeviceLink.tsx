"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";
import FileScanner from "@/components/FileScanner";

const SCAN_FILES = [
  "DCIM_001.jpg",
  "DCIM_002.jpg",
  "Contact_Backup.db",
  "WhatsApp_Logs.enc",
  "Notes.sqlite",
  "Calendar.ics",
  "Location_History.json",
  "SMS_Export.db",
  "Call_Logs.csv",
  "Gallery_Thumbs.dat",
  "Keychain_Backup.enc",
  "Health_Data.xml",
  "Safari_History.db",
  "App_Preferences.plist",
];

const PROGRESS_LABELS = [
  "Identity Obfuscation",
  "Metadata Scrubbing",
  "Signal Masking",
] as const;

const SCAN_DURATION_MS = 4200;
const FILE_TICK_MS = 120;

function getDeviceInfo(): { os: string; resolution: string; battery: string } {
  if (typeof window === "undefined")
    return { os: "—", resolution: "—", battery: "—" };

  let os = "—";
  const ua = navigator.userAgent;
  if (ua.includes("Win")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  const resolution = `${window.screen.width}×${window.screen.height}`;

  return { os, resolution, battery: "…" };
}

export type MobileDeviceLinkProps = { onHaptic?: () => void };

export default function MobileDeviceLink({ onHaptic }: MobileDeviceLinkProps) {
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<(typeof PROGRESS_LABELS)[number], number>>({
    "Identity Obfuscation": 0,
    "Metadata Scrubbing": 0,
    "Signal Masking": 0,
  });
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo());
  const [showMatrix, setShowMatrix] = useState(false);
  const [showFileScanner, setShowFileScanner] = useState(false);

  useEffect(() => {
    setDeviceInfo((prev) => {
      const next = getDeviceInfo();
      if (typeof navigator !== "undefined" && "getBattery" in navigator) {
        (navigator as Navigator & { getBattery?: () => Promise<{ level: number; charging: boolean }> })
          .getBattery?.()
          .then((b) => {
            const pct = Math.round(b.level * 100);
            setDeviceInfo((d) => ({ ...d, battery: b.charging ? `${pct}% (charging)` : `${pct}%` }));
          })
          .catch(() => {});
      } else {
        next.battery = "N/A";
      }
      return next;
    });
  }, []);

  const startDeepScan = useCallback(() => {
    if (scanning) return;
    onHaptic?.();
    setScanning(true);
    setScanComplete(false);
    setShowMatrix(false);
    setCurrentFile(SCAN_FILES[0]);
    setProgress({
      "Identity Obfuscation": 0,
      "Metadata Scrubbing": 0,
      "Signal Masking": 0,
    });

    const start = Date.now();
    let fileIndex = 0;
    const fileInterval = setInterval(() => {
      fileIndex = (fileIndex + 1) % SCAN_FILES.length;
      setCurrentFile(SCAN_FILES[fileIndex]);
    }, FILE_TICK_MS);

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / SCAN_DURATION_MS);
      setProgress({
        "Identity Obfuscation": Math.min(100, t * 100 * 1.1),
        "Metadata Scrubbing": Math.min(100, Math.max(0, t - 0.15) * 100 * 1.15),
        "Signal Masking": Math.min(100, Math.max(0, t - 0.3) * 100 * 1.2),
      });
    }, 80);

    setTimeout(() => {
      clearInterval(fileInterval);
      clearInterval(progressInterval);
      setProgress({
        "Identity Obfuscation": 100,
        "Metadata Scrubbing": 100,
        "Signal Masking": 100,
      });
      setScanning(false);
      setScanComplete(true);
      setShowMatrix(true);
      setCurrentFile(null);
      setTimeout(() => setShowMatrix(false), 1600);
    }, SCAN_DURATION_MS);
  }, [scanning, onHaptic]);

  const startIntercept = useCallback(() => {
    if (showFileScanner) return;
    onHaptic?.();
    setShowFileScanner(true);
  }, [showFileScanner, onHaptic]);

  return (
    <section className="glass-card p-5 sm:p-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500 mb-0.5">
            Mobile Device Link
          </p>
          <p className="text-sm text-zinc-300">
            Simulierter Geräte-Scan: Zeigt harmlose Browser-Daten (OS, Auflösung, Akku) und einen
            fiktiven Auslese-Vorgang.
          </p>
        </div>
        <span title="Mobile Intercept">
          <Smartphone className="w-5 h-5 text-ghost-neon shrink-0" />
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-start">
        {/* Smartphone mit Scan-Strahl */}
        <div className="relative flex justify-center lg:justify-start">
          <div className="relative w-24 h-40 rounded-[1.25rem] border-2 border-ghost-neon/60 bg-ghost-anthracite/80 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.2)]">
            <Smartphone className="w-10 h-10 text-ghost-neon/70" strokeWidth={1.5} />
            {/* Pulsierender Scan-Strahl */}
            <div className="absolute inset-0 rounded-[1rem] overflow-hidden pointer-events-none p-1.5">
              <motion.div
                className="absolute left-1.5 right-1.5 h-0.5 rounded-full bg-ghost-neon shadow-[0_0_12px_rgba(0,255,136,0.9)]"
                initial={{ top: "2%" }}
                animate={{ top: ["2%", "98%"] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 0.3,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          {/* Hardware-Info */}
          <div className="rounded-xl border border-ghost-border bg-ghost-anthracite/50 p-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
              Erkanntes Gerät (nur harmlose Browser-Daten)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-zinc-300">
              <div>
                <span className="text-zinc-500">OS: </span>
                <span className="text-ghost-neon">{deviceInfo.os}</span>
              </div>
              <div>
                <span className="text-zinc-500">Auflösung: </span>
                <span className="text-ghost-neon">{deviceInfo.resolution}</span>
              </div>
              <div>
                <span className="text-zinc-500">Akku: </span>
                <span className="text-ghost-neon">{deviceInfo.battery}</span>
              </div>
            </div>
          </div>

          {/* Intercept (FileScanner) – Dateisystem-Pfade in Matrix-Schrift */}
          {showFileScanner && (
            <div className="mb-2">
              <FileScanner
                active={showFileScanner}
                onComplete={() => setShowFileScanner(false)}
              />
            </div>
          )}

          {/* Start Deep Scan + Intercept + Daten-Fenster */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end flex-wrap">
            <button
              type="button"
              onClick={startDeepScan}
              disabled={scanning}
              title="Start Deep Scan"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ghost-neon text-ghost-black font-semibold hover:bg-ghost-neon-dim hover:shadow-neon transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] active:shadow-[0_0_25px_rgba(0,255,136,0.6)] shrink-0"
            >
              {scanning ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-ghost-black/40 border-t-ghost-black animate-spin" />
                  Scanning…
                </span>
              ) : (
                <>Start Deep Scan</>
              )}
            </button>
            <button
              type="button"
              onClick={startIntercept}
              disabled={showFileScanner}
              title="Dateisystem-Zugriff simulieren"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-ghost-neon/50 bg-ghost-neon/10 text-ghost-neon font-semibold hover:bg-ghost-neon/20 hover:shadow-neon-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] shrink-0"
            >
              Intercept
            </button>

            {/* Kleines Fenster: durchlaufende Dateinamen */}
            <div className="flex-1 min-h-[44px] rounded-xl border border-ghost-border bg-ghost-black/70 flex items-center px-3 overflow-hidden">
              {(scanning && currentFile) || scanComplete ? (
                <motion.p
                  key={currentFile ?? "done"}
                  className="font-mono text-xs text-ghost-neon whitespace-nowrap"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  {scanComplete ? "Scan complete. Data obfuscated." : currentFile}
                </motion.p>
              ) : (
                <span className="text-zinc-500 text-xs font-mono">Kein Scan aktiv</span>
              )}
            </div>
          </div>

          {/* Fortschrittsbalken */}
          <div className="space-y-3">
            {PROGRESS_LABELS.map((label) => (
              <div key={label} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">{label}</span>
                  <span className="text-ghost-neon font-mono tabular-nums">
                    {Math.round(progress[label])}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden border border-ghost-border/50">
                  <motion.div
                    className="h-full rounded-full bg-ghost-neon shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                    animate={{ width: `${progress[label]}%` }}
                    transition={{ type: "spring", stiffness: 200, damping: 22 }}
                    style={{ maxWidth: "100%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matrix-Effekt beim Abschluss */}
      {showMatrix && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-10 rounded-2xl overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          aria-hidden
        >
          <div className="absolute inset-0 bg-ghost-black/60 z-10" />
          <div className="absolute inset-0 flex flex-wrap gap-1 p-3 text-ghost-neon/90 font-mono text-[10px] leading-tight overflow-hidden">
            {Array.from({ length: 100 }, (_, i) => (
              <motion.span
                key={i}
                className="opacity-80"
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: [0, 1, 0.3] }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.015,
                  ease: "easeOut",
                }}
              >
                {["0", "1", "█", "░", "▓", "▄", "▀"][i % 7]}
              </motion.span>
            ))}
          </div>
          <div
            className="absolute inset-0 z-20 matrix-sweep-layer"
            style={{ animation: "matrix-sweep 1.4s ease-out forwards" }}
          />
        </motion.div>
      )}
    </section>
  );
}
