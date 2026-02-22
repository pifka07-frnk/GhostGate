"use client";

import { Smartphone, ShieldCheck } from "lucide-react";

export default function TechFocus() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-ghost-neon/10 border border-ghost-neon/30 shrink-0">
            <Smartphone className="w-7 h-7 text-ghost-neon" strokeWidth={2} />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-ghost-neon" />
              Local On-Device VPN
            </h3>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              Alles läuft lokal auf deinem Gerät. Keine Nutzerdaten verlassen jemals dein Handy –
              kein Cloud-Sync, keine Server-Logs. GhostGate ist dein unsichtbarer Schild.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
