"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Fingerprint, Lock, Unlock, User, X } from "lucide-react";
import type { VaultEntry } from "@/lib/ghostVaultStorage";

const VAULT_HEADER = "--- GHOSTGATE ENCRYPTED MESSAGE ---";
const BIOMETRIC_SCAN_MS = 1800;
const AUTO_LOCK_MS = 30_000;
const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024; // 5 MB (simuliert/typisches localStorage-Limit)

function formatVaultTime(ms: number): string {
  const d = new Date(ms);
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60_000) return "gerade eben";
  if (diff < 3600_000) return `vor ${Math.floor(diff / 60_000)} Min`;
  if (diff < 86400_000) return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function maskEncrypted(encryptedBase64: string): string {
  if (encryptedBase64.length <= 8) return "••••••••";
  return encryptedBase64.slice(0, 4) + "••••••••" + encryptedBase64.slice(-4);
}

function triggerHaptic(): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(50);
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
      gain.gain.linearRampToValueAtTime(0.1, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.start(start);
      osc.stop(start + duration);
    };
    playTone(523.25, 0, 0.14);
    playTone(659.25, 0.1, 0.16);
    playTone(783.99, 0.22, 0.2);
  } catch {
    /* ignore */
  }
}

function getVaultStorageBytes(entries: VaultEntry[]): number {
  if (typeof window === "undefined") return 0;
  try {
    return new TextEncoder().encode(JSON.stringify(entries)).length;
  } catch {
    return 0;
  }
}

function downloadEntryAsTxt(entry: VaultEntry): void {
  let body: string;
  if (entry.type === "encryption") {
    body = entry.encryptedBase64;
  } else {
    body = `Identity\nName: ${entry.name}\nEmail: ${entry.email}\nLocation: ${entry.location}`;
  }
  const content = `${VAULT_HEADER}\n${body}\n`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ghostgate-${entry.type}-${entry.id.slice(-6)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export type GhostVaultProps = {
  open: boolean;
  onClose: () => void;
  entries: VaultEntry[];
  onDecrypt: (encryptedBase64: string, key: string) => string;
  onWipeAll: () => void;
  onProtocolZeroRequest?: () => void;
};

export default function GhostVault({ open, onClose, entries, onDecrypt, onWipeAll, onProtocolZeroRequest }: GhostVaultProps) {
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<{ id: string; text: string } | null>(null);
  const [wipeGlitch, setWipeGlitch] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const autoLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanDoneRef = useRef(false);

  useEffect(() => {
    if (open) {
      setVaultUnlocked(false);
      scanDoneRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!open) setIsExiting(true);
    else setIsExiting(false);
  }, [open]);

  const resetAutoLock = useCallback(() => {
    if (autoLockTimerRef.current) clearTimeout(autoLockTimerRef.current);
    if (!open || !vaultUnlocked) return;
    autoLockTimerRef.current = setTimeout(() => {
      autoLockTimerRef.current = null;
      setVaultUnlocked(false);
      onClose();
    }, AUTO_LOCK_MS);
  }, [open, vaultUnlocked, onClose]);

  useEffect(() => {
    if (open && vaultUnlocked) resetAutoLock();
    return () => {
      if (autoLockTimerRef.current) clearTimeout(autoLockTimerRef.current);
    };
  }, [open, vaultUnlocked, resetAutoLock]);

  const startBiometricScan = useCallback(() => {
    if (biometricScanning || scanDoneRef.current) return;
    triggerHaptic();
    setBiometricScanning(true);
    scanDoneRef.current = true;
    const t = setTimeout(() => {
      playAccessGrantedSound();
      setBiometricScanning(false);
      setVaultUnlocked(true);
    }, BIOMETRIC_SCAN_MS);
    return () => clearTimeout(t);
  }, [biometricScanning]);

  const handleDecryptClick = useCallback(
    (entry: VaultEntry) => {
      if (entry.type !== "encryption") return;
      const key = window.prompt("Passwort zum Entschlüsseln eingeben:");
      if (key == null) return;
      const result = onDecrypt(entry.encryptedBase64, key);
      setDecryptedContent({ id: entry.id, text: result });
      resetAutoLock();
    },
    [onDecrypt, resetAutoLock]
  );

  const handleWipeAll = useCallback(() => {
    setWipeGlitch(true);
    setTimeout(() => {
      onWipeAll();
      onClose();
      setWipeGlitch(false);
      setDecryptedContent(null);
    }, 650);
  }, [onWipeAll, onClose]);

  const visible = open || isExiting;
  if (!visible) return null;

  const storageBytes = getVaultStorageBytes(entries);
  const storagePct = Math.min(100, (storageBytes / STORAGE_QUOTA_BYTES) * 100);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[9000] bg-ghost-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={() => !isExiting && onClose()}
        aria-hidden
      />
      <motion.aside
        className="fixed top-0 right-0 bottom-0 z-[9001] w-full max-w-md bg-ghost-anthracite border-l border-ghost-border shadow-2xl flex flex-col overflow-hidden"
        initial={{ x: "100%" }}
        animate={{ x: isExiting ? "100%" : 0 }}
        transition={{ type: "spring", damping: 32, stiffness: 260 }}
        onAnimationComplete={() => {
          if (isExiting) setIsExiting(false);
        }}
      >
        <div className="p-4 border-b border-ghost-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-ghost-neon" />
            <h2 className="text-lg font-semibold text-white">Encrypted Archive</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!vaultUnlocked ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <p className="text-xs text-zinc-500 mb-4 text-center">Biometrie erforderlich</p>
            <button
              type="button"
              onClick={startBiometricScan}
              onTouchStart={(e) => { e.preventDefault(); startBiometricScan(); }}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-ghost-neon/30 bg-ghost-black/40 focus:outline-none focus:ring-2 focus:ring-ghost-neon/50 touch-manipulation"
              aria-label="Biometrie scannen"
            >
              <div className="relative w-16 h-16 flex items-center justify-center">
                <motion.div
                  className="text-ghost-neon"
                  animate={biometricScanning ? {} : { scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Fingerprint className="w-full h-full drop-shadow-[0_0_16px_rgba(0,255,136,0.5)]" strokeWidth={1.2} />
                </motion.div>
                <AnimatePresence>
                  {biometricScanning && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none overflow-hidden rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-ghost-neon shadow-[0_0_12px_rgba(0,255,136,0.8)]"
                        initial={{ top: "-5%" }}
                        animate={{ top: "105%" }}
                        transition={{ duration: BIOMETRIC_SCAN_MS / 1000, ease: "easeInOut" }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-xs text-zinc-500">
                {biometricScanning ? "Scanning Identity…" : "Berühren zum Entsperren"}
              </span>
            </button>
          </div>
        ) : (
          <>
            {/* Speicher-Fortschrittsanzeige */}
            <div className="px-4 pt-3 pb-2 shrink-0">
              <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                <span>Lokaler Speicher (Secrets)</span>
                <span>{storagePct.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden border border-ghost-border/50">
                <motion.div
                  className="h-full rounded-full bg-ghost-neon"
                  initial={{ width: 0 }}
                  animate={{ width: `${storagePct}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                  style={{ maxWidth: "100%" }}
                />
              </div>
              <p className="text-[10px] text-zinc-600 mt-0.5">
                {(storageBytes / 1024).toFixed(1)} KB / {(STORAGE_QUOTA_BYTES / 1024 / 1024).toFixed(0)} MB
              </p>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-ghost"
              onClick={resetAutoLock}
              onScroll={resetAutoLock}
              onTouchStart={resetAutoLock}
            >
              {entries.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">Noch keine Einträge im Vault.</p>
              ) : (
                entries
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((entry) => (
                    <motion.div
                      key={entry.id}
                      layout
                      className="rounded-xl border border-ghost-border bg-ghost-black/60 p-3"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          <Lock className="w-4 h-4 text-ghost-neon" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">
                            {formatVaultTime(entry.createdAt)}
                          </p>
                          {entry.type === "encryption" ? (
                            <>
                              <p className="font-mono text-xs text-zinc-400 break-all mb-2">
                                {decryptedContent?.id === entry.id
                                  ? decryptedContent.text
                                  : maskEncrypted(entry.encryptedBase64)}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {decryptedContent?.id !== entry.id && (
                                  <button
                                    type="button"
                                    onClick={() => handleDecryptClick(entry)}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-ghost-neon/40 bg-ghost-neon/10 text-ghost-neon text-xs font-medium hover:bg-ghost-neon/20 transition-colors"
                                  >
                                    <Unlock className="w-3 h-3" />
                                    Decrypt
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => { downloadEntryAsTxt(entry); resetAutoLock(); }}
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-ghost-border bg-ghost-anthracite/80 text-zinc-400 text-xs font-medium hover:text-ghost-neon hover:border-ghost-neon/40 transition-colors"
                                >
                                  <Download className="w-3 h-3" />
                                  Download Encrypted
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-xs text-zinc-400 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Identity: {entry.email.replace(/(.{2}).*(@.*)/, "$1***$2")}
                              </p>
                              <p className="text-[10px] text-zinc-500 mt-1">
                                {entry.name} · {entry.location}
                              </p>
                              <button
                                type="button"
                                onClick={() => { downloadEntryAsTxt(entry); resetAutoLock(); }}
                                className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-ghost-border bg-ghost-anthracite/80 text-zinc-400 text-xs font-medium hover:text-ghost-neon hover:border-ghost-neon/40 transition-colors"
                              >
                                <Download className="w-3 h-3" />
                                Download Encrypted
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
              )}
            </div>

            <div className="p-4 border-t border-ghost-border shrink-0 space-y-2">
              {onProtocolZeroRequest && (
                <button
                  type="button"
                  onClick={onProtocolZeroRequest}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm font-bold border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all active:scale-[0.98] uppercase tracking-wider"
                >
                  Initialize Protocol Zero
                </button>
              )}
              <button
                type="button"
                onClick={handleWipeAll}
                disabled={entries.length === 0}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-sm font-semibold border border-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${wipeGlitch ? "glitch-animate" : ""}`}
              >
                Wipe All Data
              </button>
            </div>
          </>
        )}
      </motion.aside>
    </>
  );
}
