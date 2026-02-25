"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ThreatMap from "@/components/ThreatMap";
import MobileDeviceLink from "@/components/MobileDeviceLink";
import {
  Activity,
  AlertTriangle,
  Copy,
  Globe2,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Maximize2,
  Radar,
  Settings,
  Shield,
  Sparkles,
  Unlock,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";

/** Kurze Vibration, falls vom Gerät unterstützt */
function triggerHaptic(): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  } catch {
    /* ignore */
  }
}

type SystemHealth = { battery: string; network: string };
function getSystemHealth(): SystemHealth {
  if (typeof window === "undefined") return { battery: "—", network: "—" };
  const nav = navigator as Navigator & {
    getBattery?: () => Promise<{ level: number; charging: boolean }>;
    connection?: { effectiveType?: string; type?: string };
  };
  return { battery: "…", network: nav.connection?.effectiveType ?? nav.connection?.type ?? "—" };
}

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Identity Shields", icon: Shield, active: false },
  { label: "Tracking Logs", icon: Radar, active: false },
  { label: "Settings", icon: Settings, active: false },
];

const INITIAL_BLOCKED_COUNT = 128;

const BLOCK_EVENTS: { title: string; description: string }[] = [
  { title: "Google Analytics blocked", description: "auf shopping-site.com" },
  { title: "Facebook Pixel obfuscated", description: "auf news-portal.de" },
  { title: "Fingerprinting attempt denied", description: "Canvas/WebGL verschleiert" },
  { title: "Cross-site tracker isolated", description: "Third-party Domain blockiert" },
  { title: "Tracker blocked", description: "Google Analytics auf aktueller Seite" },
  { title: "Ad script blocked", description: "DoubleClick Request unterdrückt" },
  { title: "Session replay blocked", description: "Hotjar / FullStory abgewiesen" },
  { title: "Criteo pixel obfuscated", description: "Retargeting-Daten verschleiert" },
  { title: "Cross-site tracking denied", description: "Third-party Cookie blockiert" },
  { title: "Device fingerprint masked", description: "Hardware-Signatur verschleiert" },
  { title: "Location leak prevented", description: "GPS-Anfrage umgeleitet" },
  { title: "Analytics beacon blocked", description: "Ping an Tracker-Server verworfen" },
  { title: "Social widget isolated", description: "Like-Button in Sandbox" },
  { title: "Tracking script obfuscated", description: "Skript-Ausführung unterbrochen" },
  { title: "Identity graph request denied", description: "ID-Verknüpfung blockiert" },
];

function formatTimeAgo(ms: number) {
  if (ms < 60_000) return "gerade eben";
  if (ms < 3600_000) return `vor ${Math.floor(ms / 60_000)} Min`;
  return `vor ${Math.floor(ms / 3600_000)} Std`;
}

type TrackingLogEntry = {
  id: string;
  title: string;
  description: string;
  time: string;
  createdAt: number;
};

type GhostIdentity = {
  name: string;
  email: string;
  location: string;
};

const FIRST_NAMES = ["Nova", "Milo", "Skye", "Ari", "Lena", "Kai", "Zoe", "Noah", "Mira", "Juno"];
const LAST_NAMES = ["Voss", "Kade", "Nyx", "Sterling", "Haze", "Onyx", "Vale", "Cipher", "Crow", "Rune"];
const LOCATIONS = [
  "Tokyo, JP",
  "Berlin, DE",
  "Reykjavík, IS",
  "Singapore, SG",
  "Helsinki, FI",
  "Lisbon, PT",
  "Seoul, KR",
  "Vancouver, CA",
];

function randomFrom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createGhostIdentity(): GhostIdentity {
  const name = `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
  const handleBase = name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
  const suffix = Math.floor(100 + Math.random() * 900);
  return {
    name,
    email: `${handleBase}.${suffix}@ghostgate.com`,
    location: randomFrom(LOCATIONS),
  };
}

function base64EncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64DecodeToBytes(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function encryptMessage(message: string, key: string): string {
  if (!key.trim()) return "(Key fehlt)";
  const enc = new TextEncoder();
  const msgBytes = enc.encode(message);
  const keyBytes = enc.encode(key);
  const out = new Uint8Array(msgBytes.length);
  for (let i = 0; i < msgBytes.length; i++) out[i] = msgBytes[i] ^ keyBytes[i % keyBytes.length];
  return base64EncodeBytes(out);
}

function decryptMessage(encrypted: string, key: string): string {
  if (!key.trim()) return "(Key fehlt)";
  try {
    const enc = new TextEncoder();
    const keyBytes = enc.encode(key);
    const raw = base64DecodeToBytes(encrypted);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw[i] ^ keyBytes[i % keyBytes.length];
    return new TextDecoder().decode(out);
  } catch {
    return "(Entschlüsselung fehlgeschlagen – falscher Key?)";
  }
}

const INITIAL_LOGS: TrackingLogEntry[] = [
  { id: "0", title: "Fake Email generated", description: "für Amazon Login verwendet", time: "vor 3 Min", createdAt: Date.now() - 180_000 },
  { id: "1", title: "Tracker blocked", description: "Google Analytics auf news-portal.com", time: "vor 12 Min", createdAt: Date.now() - 720_000 },
  { id: "2", title: "Location Spoofing active", description: "Standort auf Tokio gesetzt", time: "vor 45 Min", createdAt: Date.now() - 2700_000 },
  { id: "3", title: "Virtual Card refreshed", description: "neue synthetische Kartendaten erstellt", time: "heute, 08:17", createdAt: Date.now() - 3600_000 },
];

export default function DashboardShell() {
  const streamCells = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        delay: (i % 6) * 0.25,
        blinkDelay: Math.random() * 4,
        blinkDuration: 2 + Math.random() * 2,
      })),
    [],
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [identity, setIdentity] = useState<GhostIdentity | null>(null);
  const [trackingLogs, setTrackingLogs] = useState<TrackingLogEntry[]>(INITIAL_LOGS);
  const [blockedCount, setBlockedCount] = useState(INITIAL_BLOCKED_COUNT);
  const timeoutRef = useRef<number | null>(null);

  const [secureMessage, setSecureMessage] = useState("");
  const [secureKey, setSecureKey] = useState("");
  const [secureOutput, setSecureOutput] = useState("");
  const [showMatrixEffect, setShowMatrixEffect] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selfDestructEnabled, setSelfDestructEnabled] = useState(false);
  const [selfDestructCountdown, setSelfDestructCountdown] = useState<number | null>(null);
  const selfDestructIntervalRef = useRef<number | null>(null);
  const [soundsMuted, setSoundsMuted] = useState(false);
  const [outputFlashRed, setOutputFlashRed] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [panicMode, setPanicMode] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const logoClickCountRef = useRef(0);
  const logoClickTimeRef = useRef(0);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>(getSystemHealth);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getAudioContext = (): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (audioContextRef.current) return audioContextRef.current;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioContextRef.current = new Ctx();
    return audioContextRef.current;
  };

  const playBurnSound = () => {
    if (soundsMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      /* ignore */
    }
  };

  const playClickSound = () => {
    if (soundsMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      /* ignore */
    }
  };

  const handleCopyOutput = async () => {
    if (!secureOutput || secureOutput === "[DELETED]") return;
    try {
      await navigator.clipboard.writeText(secureOutput);
      setCopied(true);
      playClickSound();
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    function addBlockEvent() {
      const event = randomFrom(BLOCK_EVENTS);
      const id = `log-${Date.now()}`;
      const createdAt = Date.now();
      setBlockedCount((c) => c + 1);
      setTrackingLogs((prev) => {
        const next = [{ id, ...event, time: "gerade eben", createdAt }, ...prev];
        return next.slice(0, 20);
      });
    }

    function scheduleNext() {
      const delay = 3000 + Math.random() * 3000;
      timeoutRef.current = window.setTimeout(() => {
        addBlockEvent();
        scheduleNext();
      }, delay);
    }
    scheduleNext();
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setTrackingLogs((prev) =>
        prev.map((entry) => ({
          ...entry,
          time: formatTimeAgo(Date.now() - entry.createdAt),
        })),
      );
    }, 60_000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    setSystemHealth(getSystemHealth());
    const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number; charging: boolean }> };
    if (nav.getBattery) {
      nav.getBattery().then((b) => {
        const pct = Math.round(b.level * 100);
        setSystemHealth((s) => ({ ...s, battery: b.charging ? `${pct}% ⚡` : `${pct}%` }));
      }).catch(() => {});
    }
  }, []);

  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setIdentity(null);

    window.setTimeout(() => {
      setIdentity(createGhostIdentity());
      setIsGenerating(false);
    }, 900);
  };

  const handleEncrypt = () => {
    setShowMatrixEffect(true);
    setSelfDestructCountdown(null);
    if (selfDestructIntervalRef.current !== null) {
      clearInterval(selfDestructIntervalRef.current);
      selfDestructIntervalRef.current = null;
    }
    window.setTimeout(() => {
      setSecureOutput(encryptMessage(secureMessage, secureKey));
      setShowMatrixEffect(false);
      if (selfDestructEnabled) {
        setSelfDestructCountdown(10);
        selfDestructIntervalRef.current = window.setInterval(() => {
          setSelfDestructCountdown((c) => {
            if (c === null || c <= 1) {
              if (selfDestructIntervalRef.current !== null) {
                clearInterval(selfDestructIntervalRef.current);
                selfDestructIntervalRef.current = null;
              }
              setSecureOutput("[DELETED]");
              playBurnSound();
              setOutputFlashRed(true);
              window.setTimeout(() => setOutputFlashRed(false), 400);
              return null;
            }
            return c - 1;
          });
        }, 1000) as unknown as number;
      }
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (selfDestructIntervalRef.current !== null) {
        clearInterval(selfDestructIntervalRef.current);
      }
    };
  }, []);

  const handleDecrypt = () => {
    setSecureOutput(decryptMessage(secureMessage, secureKey));
  };

  const handleThreatMapPing = useCallback((entry: { title: string; description: string }) => {
    const id = `log-${Date.now()}`;
    const createdAt = Date.now();
    setBlockedCount((c) => c + 1);
    setTrackingLogs((prev) => {
      const next = [{ id, ...entry, time: "gerade eben", createdAt }, ...prev];
      return next.slice(0, 20);
    });
  }, []);

  const triggerPanic = () => {
    triggerHaptic();
    setSoundsMuted(true);
    if (selfDestructIntervalRef.current !== null) {
      clearInterval(selfDestructIntervalRef.current);
      selfDestructIntervalRef.current = null;
    }
    setSelfDestructCountdown(null);
    setPanicMode(true);
  };

  const exitPanic = () => {
    setPanicMode(false);
  };

  const toggleStealthFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - logoClickTimeRef.current > 800) logoClickCountRef.current = 0;
    logoClickCountRef.current += 1;
    logoClickTimeRef.current = now;
    if (logoClickCountRef.current >= 5) {
      logoClickCountRef.current = 0;
      setShowEasterEgg(true);
      window.setTimeout(() => setShowEasterEgg(false), 3000);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        triggerPanic();
      }
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        exitPanic();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      {panicMode ? (
        <div className="fixed inset-0 z-[9999] bg-white">
          {/* Tarnung: Google-Suche "Wirtschaftswachstum 2026" */}
          <div className="min-h-screen flex flex-col">
            <header className="flex items-center gap-4 p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-2xl font-normal">G</span>
                <span className="text-xl text-blue-600">o</span>
                <span className="text-xl text-red-500">o</span>
                <span className="text-xl text-yellow-500">g</span>
                <span className="text-xl text-blue-600">l</span>
                <span className="text-xl text-red-500">e</span>
              </div>
              <div className="flex-1 max-w-2xl mx-4 flex items-center rounded-full border border-gray-300 px-4 py-2.5 bg-white shadow-sm">
                <span className="text-gray-500 text-sm">Wirtschaftswachstum 2026</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100" />
              <div className="w-8 h-8 rounded-full bg-gray-100" />
            </header>
            <main className="flex-1 max-w-3xl mx-auto px-4 py-6 text-left">
              <p className="text-sm text-gray-500 mb-4">Ungefähr 127.000.000 Ergebnisse (0,42 Sekunden)</p>
              <div className="space-y-4">
                {[
                  { title: "Wirtschaftswachstum 2026: Prognose und Analyse", url: "bundesregierung.de", desc: "Offizielle Schätzung des BIP-Wachstums für 2026 ..." },
                  { title: "Wirtschaftswachstum Deutschland 2026 – Statistisches Bundesamt", url: "destatis.de", desc: "Aktuelle Daten und Indikatoren zum Bruttoinlandsprodukt ..." },
                  { title: "OECD-Prognose: Wirtschaftswachstum 2026 weltweit", url: "oecd.org", desc: "Wachstumsprognosen für die G20-Staaten ..." },
                  { title: "Wirtschaftswachstum 2026: Was Experten erwarten", url: "handelsblatt.com", desc: "Konjunkturprognosen und Szenarien für das Jahr 2026 ..." },
                ].map((r, i) => (
                  <div key={i} className="group">
                    <a href="#" className="block text-blue-700 text-lg group-hover:underline" onClick={(e) => e.preventDefault()}>
                      {r.title}
                    </a>
                    <p className="text-green-700 text-sm">{r.url} › ...</p>
                    <p className="text-gray-600 text-sm">{r.desc}</p>
                  </div>
                ))}
              </div>
            </main>
            {/* Versteckter Reset: Klick in die untere rechte Ecke */}
            <button
              type="button"
              onClick={exitPanic}
              title="Strg+Alt+G zum Zurückkehren"
              className="fixed bottom-0 right-0 w-16 h-16 opacity-0 cursor-default"
              aria-label="Zurück zum Dashboard"
            />
          </div>
        </div>
      ) : null}

      {showEasterEgg && !panicMode ? (
        <div className="fixed inset-0 z-[9998] pointer-events-none flex items-center justify-center bg-ghost-black/90">
          <p className="font-mono text-ghost-neon text-sm sm:text-base px-4 py-2 border border-ghost-neon/50 bg-ghost-black/80 shadow-neon rounded-lg animate-pulse">
            ACCESS GRANTED: WELCOME GHOST #001
          </p>
          <div
            className="absolute inset-0 scan-line pointer-events-none"
            aria-hidden
          >
            <div className="w-full h-px bg-gradient-to-r from-transparent via-ghost-neon/80 to-transparent shadow-[0_0_20px_rgba(0,255,136,0.6)]" />
          </div>
        </div>
      ) : null}

      <div className="min-h-screen bg-ghost-black text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 border-b md:border-b-0 md:border-r border-ghost-border bg-ghost-anthracite/80 backdrop-blur-xl flex md:flex-col justify-between">
        <div className="flex md:flex-col items-center md:items-stretch gap-4 px-4 py-3 md:py-6">
          {/* Logo / App Name */}
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-3 md:mb-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-ghost-neon/40"
            aria-label="GhostGate"
          >
            <div className="w-8 h-8 rounded-xl bg-ghost-neon/10 border border-ghost-neon/60 flex items-center justify-center shadow-neon-sm">
              <Globe2 className="w-4 h-4 text-ghost-neon" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-white leading-tight">GhostGate</p>
              <p className="text-xs text-zinc-500">Dashboard</p>
            </div>
          </button>

          {/* Nav */}
          <nav className="flex-1 flex md:flex-col gap-2 w-full">
            {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
              <button
                key={label}
                className={`flex items-center gap-2 md:gap-3 px-3 py-2 rounded-xl text-sm transition-colors w-full justify-center md:justify-start ${
                  active
                    ? "bg-ghost-neon/15 text-ghost-neon border border-ghost-neon/40 shadow-neon-sm"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline md:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Logout unten */}
        <div className="px-4 py-3 border-t border-ghost-border/60 flex flex-col gap-2">
          <button
            type="button"
            onClick={triggerPanic}
            title="Sofort tarnen (Escape)"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold border border-red-500 transition-all active:scale-[0.98] active:shadow-[0_0_25px_rgba(239,68,68,0.6)]"
          >
            <AlertTriangle className="w-4 h-4" />
            PANIC
          </button>
          <div className="flex items-center justify-between gap-3">
            <div className="hidden md:block text-xs text-zinc-500">
              <p>Angemeldet als</p>
              <p className="text-zinc-300">ghost.user@secure</p>
            </div>
            <button className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-ghost-border bg-ghost-black/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ghost-neon/40 bg-ghost-neon/10 text-xs text-ghost-neon shadow-neon-sm"
              animate={{
                boxShadow: [
                  "0 0 12px rgba(0,255,136,0.3)",
                  "0 0 20px rgba(0,255,136,0.5)",
                  "0 0 12px rgba(0,255,136,0.3)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-ghost-neon animate-pulse" />
              <span className="font-semibold uppercase tracking-wide">Protection: Active</span>
            </motion.div>
            <p className="hidden sm:block text-xs text-zinc-500">
              Local On-Device VPN aktiv – deine Daten verlassen nie dein Handy.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden min-[500px]:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-ghost-border bg-ghost-anthracite/60 text-[10px] sm:text-xs font-mono text-zinc-400" title="System Health">
              <span title="Batteriestand">🔋 {systemHealth.battery}</span>
              <span className="text-zinc-600">|</span>
              <span title="Netzwerktyp">📶 {systemHealth.network}</span>
            </div>
            <button
              type="button"
              onClick={toggleStealthFullscreen}
              title={isFullscreen ? "Vollbild beenden" : "Go Stealth Mode – Vollbild (wie App)"}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-ghost-neon/40 bg-ghost-neon/10 text-ghost-neon text-xs font-medium hover:bg-ghost-neon/20 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{isFullscreen ? "Exit Stealth" : "Go Stealth Mode"}</span>
            </button>
            <button className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline">ghost.user</span>
            </button>
          </div>
        </header>

        {/* Content: Mobile einspaltig mit Threat Map + Scanner oben (order) */}
        <main className="flex-1 px-4 sm:px-6 py-6 overflow-auto flex flex-col gap-6">
          {/* Stats cards – auf Mobile unter Karte/Scanner */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 order-3 md:order-1">
            <motion.div
              className="glass-card p-4 sm:p-5"
              whileHover={{ y: -3, boxShadow: "0 0 24px rgba(0,255,136,0.35)" }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Active Shields</p>
              <p className="text-2xl font-semibold text-white mb-1">3</p>
              <p className="text-xs text-zinc-500">+1 heute aktiviert</p>
            </motion.div>
            <motion.div
              className="glass-card p-4 sm:p-5"
              whileHover={{ y: -3, boxShadow: "0 0 24px rgba(0,255,136,0.35)" }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Blocked Trackers</p>
              <div className="h-8 flex items-end overflow-hidden">
                <motion.span
                  key={blockedCount}
                  className="text-2xl font-semibold text-white mb-1 block"
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  {blockedCount}
                </motion.span>
              </div>
              <p className="text-xs text-zinc-500">in den letzten 24 Stunden</p>
            </motion.div>
            <motion.div
              className="glass-card p-4 sm:p-5"
              whileHover={{ y: -3, boxShadow: "0 0 24px rgba(0,255,136,0.35)" }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Identity Health</p>
              <p className="text-2xl font-semibold text-white mb-1">92%</p>
              <p className="text-xs text-zinc-500">kaum echte Daten im Umlauf</p>
            </motion.div>
          </section>

          {/* Global Threat Map – auf Mobile ganz oben */}
          <section className="glass-card p-4 sm:p-5 order-1 md:order-2">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500 mb-0.5">
                  Global Threat Map
                </p>
                <p className="text-sm text-zinc-300">
                  Live-Pings: blockierte Anfragen weltweit. Jeder Ping = neuer Eintrag in den Tracking Logs.
                </p>
              </div>
              <span title="Live Pings">
                <Activity className="w-5 h-5 text-ghost-neon" />
              </span>
            </div>
            <ThreatMap onPing={handleThreatMapPing} />
          </section>

          {/* Mobile Device Link – auf Mobile direkt unter Threat Map */}
          <div className="order-2 md:order-3">
            <MobileDeviceLink onHaptic={triggerHaptic} />
          </div>

          {/* Ghost Identity Generator */}
          <section className="glass-card p-5 sm:p-6 order-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                  Ghost Identity Generator
                </p>
                <p className="text-sm text-zinc-300">
                  Erzeuge eine neue verschleierte Identität (Name, @ghostgate.com, Standort) – ohne
                  echte Daten preiszugeben.
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                title="Generate new identity"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ghost-neon text-ghost-black font-semibold hover:bg-ghost-neon-dim hover:shadow-neon transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] active:shadow-[0_0_25px_rgba(0,255,136,0.6)]"
              >
                {isGenerating ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-ghost-black/40 border-t-ghost-black animate-spin" />
                    Generating…
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate New Identity
                  </>
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {identity ? (
                <motion.div
                  key={identity.email}
                  className="mt-5 rounded-2xl border border-ghost-neon/30 bg-ghost-surface/50 backdrop-blur-xl p-5 shadow-glass relative overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <div
                    className="absolute -inset-24 opacity-30"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 20%, rgba(0,255,136,0.25), transparent 55%)",
                    }}
                    aria-hidden
                  />

                  <div className="relative">
                    <p className="text-sm font-semibold text-white mb-4">Generated Identity</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-ghost-neon mt-0.5" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-zinc-500">Name</p>
                          <p className="text-zinc-100">{identity.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-ghost-neon mt-0.5" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-zinc-500">Email</p>
                          <p className="text-zinc-100 break-all">{identity.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-ghost-neon mt-0.5" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-zinc-500">
                            Virtual Location
                          </p>
                          <p className="text-zinc-100">{identity.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>

          {/* Secure Encryption Suite */}
          <section className="glass-card p-5 sm:p-6 relative overflow-hidden order-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-ghost-neon" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500 mb-0.5">
                    Secure Encryption Suite
                  </p>
                  <p className="text-sm text-zinc-300">
                    Nachricht mit Secret Access Key verschlüsseln (Base64) oder entschlüsseln. Derselbe Key wird für Encrypt & Decrypt genutzt.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoundsMuted((m) => !m)}
                title={soundsMuted ? "Sound aktivieren" : "Sound stummschalten"}
                className="p-2 rounded-lg border border-ghost-border bg-ghost-anthracite/60 text-zinc-400 hover:text-ghost-neon hover:border-ghost-neon/40 transition-colors shrink-0"
              >
                {soundsMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-1.5">
                  Nachricht
                </label>
                <div className="relative">
                  <textarea
                    value={secureMessage}
                    onChange={(e) => setSecureMessage(e.target.value)}
                    placeholder="Text zum Verschlüsseln oder Base64 zum Entschlüsseln…"
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-ghost-anthracite/80 border border-ghost-border text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-ghost-neon/50 focus:ring-1 focus:ring-ghost-neon/30 resize-y min-h-[120px] font-mono text-sm"
                  />
                  {showMatrixEffect && (
                    <motion.div
                      className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      aria-hidden
                    >
                      <div className="absolute inset-0 bg-ghost-black/70 z-10" />
                      <div className="absolute inset-0 flex flex-wrap gap-1 p-2 text-ghost-neon/90 font-mono text-[10px] leading-tight overflow-hidden">
                        {Array.from({ length: 80 }, (_, i) => (
                          <motion.span
                            key={i}
                            className="opacity-80"
                            initial={{ y: -8, opacity: 0 }}
                            animate={{ y: 0, opacity: [0, 1, 0.3] }}
                            transition={{
                              duration: 0.8,
                              delay: i * 0.02,
                              ease: "easeOut",
                            }}
                          >
                            {["0", "1", "█", "░", "▓", "▄", "▀"][i % 7]}
                          </motion.span>
                        ))}
                      </div>
                      <div
                        className="absolute inset-0 z-20 matrix-sweep-layer"
                        style={{ animation: "matrix-sweep 1.2s ease-out forwards" }}
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-zinc-500 mb-1.5">
                  Secret Access Key
                </label>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    value={secureKey}
                    onChange={(e) => setSecureKey(e.target.value)}
                    placeholder="Key für Verschlüsseln & Entschlüsseln"
                    className="w-full max-w-md pl-10 pr-4 py-2.5 rounded-xl bg-ghost-anthracite/80 border border-ghost-border text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-ghost-neon/50 focus:ring-1 focus:ring-ghost-neon/30 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleEncrypt}
                  title="Encrypt message"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ghost-neon text-ghost-black font-semibold hover:bg-ghost-neon-dim hover:shadow-neon transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] active:shadow-[0_0_25px_rgba(0,255,136,0.6)]"
                >
                  <Lock className="w-4 h-4" />
                  Encrypt
                </button>
                <button
                  type="button"
                  onClick={handleDecrypt}
                  title="Decrypt with key"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-ghost-neon/50 bg-ghost-neon/10 text-ghost-neon font-semibold hover:bg-ghost-neon/20 hover:shadow-neon-sm transition-all active:scale-[0.98] active:shadow-[0_0_15px_rgba(0,255,136,0.4)]"
                >
                  <Unlock className="w-4 h-4" />
                  Decrypt
                </button>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none" title="Burn message after 10s">
                  <input
                    type="checkbox"
                    checked={selfDestructEnabled}
                    onChange={(e) => setSelfDestructEnabled(e.target.checked)}
                    className="rounded border-ghost-border bg-ghost-anthracite text-ghost-neon focus:ring-ghost-neon/50"
                  />
                  <span className="text-sm text-zinc-400">Auto-Burn after 10s</span>
                </label>
              </div>

              {secureOutput && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`rounded-xl border p-4 transition-colors duration-200 ${
                    outputFlashRed
                      ? "border-red-500 bg-red-900/20"
                      : "border-ghost-border bg-ghost-anthracite/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">Ausgabe</p>
                    <div className="flex items-center gap-2">
                      {selfDestructCountdown !== null && (
                        <span className="text-xs text-ghost-neon font-mono tabular-nums">
                          Auto-burn in {selfDestructCountdown}s
                        </span>
                      )}
                      {secureOutput !== "[DELETED]" && (
                        <button
                          type="button"
                          onClick={handleCopyOutput}
                          title="Copy to Clipboard"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-ghost-neon/40 bg-ghost-neon/10 text-ghost-neon hover:bg-ghost-neon/20 transition-colors"
                        >
                          <Copy className="w-4 h-4 shrink-0" />
                          <span className="text-xs font-medium">{copied ? "Copied!" : "Copy"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <p
                    className={`font-mono text-sm break-all whitespace-pre-wrap ${
                      secureOutput === "[DELETED]" ? "text-zinc-500 italic" : "text-zinc-200"
                    }`}
                  >
                    {secureOutput}
                  </p>
                </motion.div>
              )}
            </div>
          </section>

          {/* Main widgets: data stream + activity */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 order-6">
            {/* Data stream / grid */}
            <motion.div
              className="glass-card p-5 sm:p-6 lg:col-span-2 relative overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                    Obfuscation Stream
                  </p>
                  <p className="text-sm text-zinc-300">
                    Live-Datenströme, die mit Geisterrauschen gefüllt werden.
                  </p>
                </div>
                <Activity className="w-5 h-5 text-ghost-neon" />
              </div>

              <div className="relative mt-2 h-36 sm:h-48 md:h-56 rounded-xl bg-gradient-to-br from-zinc-900/80 via-ghost-anthracite/80 to-zinc-900/80 border border-ghost-border overflow-hidden min-h-0">
                <div className="absolute inset-0 bg-grid-pattern opacity-40" />

                {/* Geisterhafte Datenzellen – zufällige grüne Lichter */}
                <div className="relative w-full h-full grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-1 sm:gap-2 p-2 sm:p-4 min-h-0">
                  {streamCells.map((cell) => (
                    <motion.div
                      key={cell.id}
                      className="rounded-md bg-ghost-neon/10 border border-ghost-neon/20"
                      initial={{ opacity: 0.2 }}
                      animate={{
                        opacity: [0.2, 0.2, 0.95, 0.2],
                        boxShadow: [
                          "0 0 6px rgba(0,255,136,0.15)",
                          "0 0 6px rgba(0,255,136,0.15)",
                          "0 0 18px rgba(0,255,136,0.7)",
                          "0 0 6px rgba(0,255,136,0.15)",
                        ],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: cell.blinkDuration,
                        delay: cell.delay * 0.2 + cell.blinkDelay,
                        times: [0, 0.65, 0.78, 1],
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>

                {/* Badge oben drüber */}
                <motion.div
                  className="absolute inset-x-0 -top-4 flex justify-center"
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden
                >
                  <div className="px-3 py-1.5 rounded-full bg-ghost-neon/15 border border-ghost-neon/40 shadow-neon flex items-center gap-2 text-xs text-ghost-neon">
                    <Shield className="w-3.5 h-3.5" />
                    <span>GhostGate verschleiert deine Daten live</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Activity feed */}
            <motion.div
              className="glass-card p-5 sm:p-6 flex flex-col"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
                    Activity Feed
                  </p>
                  <p className="text-sm text-zinc-300">Letzte Verschleierungsvorgänge.</p>
                </div>
                <span title="Tracking Logs">
                  <Radar className="w-5 h-5 text-ghost-neon" />
                </span>
              </div>

              <div className="space-y-3 text-sm overflow-y-auto overflow-x-hidden max-h-[280px] scrollbar-ghost pr-1">
                <AnimatePresence initial={false}>
                  {trackingLogs.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex items-start justify-between gap-3 border-l border-ghost-border pl-3"
                      initial={{ opacity: 0, y: -16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      layout
                    >
                      <div>
                        <p className="font-medium text-zinc-100">{item.title}</p>
                        <p className="text-xs text-zinc-500">{item.description}</p>
                      </div>
                      <span className="text-[10px] text-zinc-500 whitespace-nowrap">{item.time}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </section>
        </main>
      </div>
    </div>
    </>
  );
}
