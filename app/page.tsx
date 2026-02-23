import Hero from "@/components/Hero";
import WorldMapMockup from "@/components/WorldMapMockup";
import ShieldBounceAnimation from "@/components/ShieldBounceAnimation";
import Features from "@/components/Features";
import TechFocus from "@/components/TechFocus";
import WaitlistForm from "@/components/WaitlistForm";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-grid-pattern">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-ghost-border bg-ghost-black/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <span className="font-bold text-white tracking-tight">GhostGate</span>
          <Link
            href="/dashboard"
            className="text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full bg-ghost-neon text-ghost-black hover:bg-ghost-neon-dim hover:shadow-neon transition-all"
          >
            Join Now
          </Link>
        </div>
      </header>

      <Hero />
      <WorldMapMockup />
      <ShieldBounceAnimation />
      <Features />
      <TechFocus />
      <WaitlistForm />

      <footer className="py-8 px-4 text-center text-zinc-500 text-sm border-t border-ghost-border">
        © {new Date().getFullYear()} GhostGate. Deine Daten. Dein Gerät. Keine Kompromisse.
      </footer>
    </main>
  );
}
