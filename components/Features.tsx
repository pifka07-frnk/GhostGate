"use client";

import { Shield, MapPin, CreditCard } from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "Data Obfuscation",
    description: "Algorithmen mit Fake-Interessen verwirren. Dein echtes Verhalten bleibt unsichtbar.",
  },
  {
    icon: MapPin,
    title: "Location Spoofing",
    description: "Apps bekommen falsche GPS-Daten. Du bestimmst, wo du „bist“ – für Tracker.",
  },
  {
    icon: CreditCard,
    title: "Identity Shields",
    description: "Synthetische Mail- und Kreditkarten-Daten. Echte Anmeldung, null Risiko.",
  },
];

export default function Features() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
          Drei Schichten. Ein Geist.
        </h2>
        <p className="text-zinc-400 text-center mb-10 md:mb-14 max-w-xl mx-auto">
          Weniger Daten, mehr Kontrolle – ohne dein Gerät zu verlassen.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="glass-card p-6 md:p-8 flex flex-col items-start text-left hover:border-ghost-neon/30 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-ghost-neon/10 border border-ghost-neon/30 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-ghost-neon" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
