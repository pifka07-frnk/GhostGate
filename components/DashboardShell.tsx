"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Globe2,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Radar,
  Settings,
  Shield,
  Sparkles,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Identity Shields", icon: Shield, active: false },
  { label: "Tracking Logs", icon: Radar, active: false },
  { label: "Settings", icon: Settings, active: false },
];

const STATS = [
  { label: "Active Shields", value: "3", helper: "+1 heute aktiviert" },
  { label: "Blocked Trackers", value: "128", helper: "in den letzten 24 Stunden" },
  { label: "Identity Health", value: "92%", helper: "kaum echte Daten im Umlauf" },
];

const ACTIVITY_ITEMS = [
  { title: "Fake Email generated", description: "für Amazon Login verwendet", time: "vor 3 Min" },
  {
    title: "Tracker blocked",
    description: "Google Analytics auf news-portal.com",
    time: "vor 12 Min",
  },
  { title: "Location Spoofing active", description: "Standort auf Tokio gesetzt", time: "vor 45 Min" },
  {
    title: "Virtual Card refreshed",
    description: "neue synthetische Kartendaten erstellt",
    time: "heute, 08:17",
  },
];

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

export default function DashboardShell() {
  const streamCells = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        delay: (i % 6) * 0.25,
      })),
    [],
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [identity, setIdentity] = useState<GhostIdentity | null>(null);

  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setIdentity(null);

    window.setTimeout(() => {
      setIdentity(createGhostIdentity());
      setIsGenerating(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-ghost-black text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 border-b md:border-b-0 md:border-r border-ghost-border bg-ghost-anthracite/80 backdrop-blur-xl flex md:flex-col justify-between">
        <div className="flex md:flex-col items-center md:items-stretch gap-4 px-4 py-3 md:py-6">
          {/* Logo / App Name */}
          <div className="flex items-center gap-3 md:mb-6">
            <div className="w-8 h-8 rounded-xl bg-ghost-neon/10 border border-ghost-neon/60 flex items-center justify-center shadow-neon-sm">
              <Globe2 className="w-4 h-4 text-ghost-neon" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-white leading-tight">GhostGate</p>
              <p className="text-xs text-zinc-500">Dashboard</p>
            </div>
          </div>

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
        <div className="px-4 py-3 border-t border-ghost-border/60 flex items-center justify-between gap-3">
          <div className="hidden md:block text-xs text-zinc-500">
            <p>Angemeldet als</p>
            <p className="text-zinc-300">ghost.user@secure</p>
          </div>
          <button className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-ghost-border bg-ghost-black/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4">
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

          <button className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">ghost.user</span>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 sm:px-6 py-6 space-y-6 overflow-auto">
          {/* Stats cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                className="glass-card p-4 sm:p-5"
                whileHover={{ y: -3, boxShadow: "0 0 24px rgba(0,255,136,0.35)" }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
              >
                <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-semibold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-zinc-500">{stat.helper}</p>
              </motion.div>
            ))}
          </section>

          {/* Ghost Identity Generator */}
          <section className="glass-card p-5 sm:p-6">
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
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ghost-neon text-ghost-black font-semibold hover:bg-ghost-neon-dim hover:shadow-neon transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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

          {/* Main widgets: data stream + activity */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

              <div className="relative mt-2 h-48 sm:h-56 rounded-xl bg-gradient-to-br from-zinc-900/80 via-ghost-anthracite/80 to-zinc-900/80 border border-ghost-border overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-40" />

                {/* Geisterhafte Datenzellen */}
                <div className="relative w-full h-full grid grid-cols-6 sm:grid-cols-8 gap-2 p-4">
                  {streamCells.map((cell) => (
                    <motion.div
                      key={cell.id}
                      className="rounded-md bg-ghost-neon/10 border border-ghost-neon/20 shadow-neon-sm"
                      initial={{ opacity: 0.15, scaleY: 0.6 }}
                      animate={{ opacity: [0.15, 0.9, 0.25], scaleY: [0.6, 1.1, 0.7] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.4,
                        delay: cell.delay,
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
                <Radar className="w-5 h-5 text-ghost-neon" />
              </div>

              <div className="space-y-3 text-sm">
                {ACTIVITY_ITEMS.map((item, idx) => (
                  <div
                    key={item.title + idx}
                    className="flex items-start justify-between gap-3 border-l border-ghost-border pl-3"
                  >
                    <div>
                      <p className="font-medium text-zinc-100">{item.title}</p>
                      <p className="text-xs text-zinc-500">{item.description}</p>
                    </div>
                    <span className="text-[10px] text-zinc-500 whitespace-nowrap">{item.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>
        </main>
      </div>
    </div>
  );
}
