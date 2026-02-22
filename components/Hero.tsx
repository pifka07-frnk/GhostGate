"use client";

export default function Hero() {
  return (
    <section className="relative pt-16 pb-12 md:pt-24 md:pb-20 px-4 sm:px-6 lg:px-8 bg-grid-pattern">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
          Sei überall,{" "}
          <span className="text-ghost-neon drop-shadow-[0_0_20px_rgba(0,255,136,0.4)]">
            außer in ihrer Datenbank.
          </span>
        </h1>
        <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          GhostGate verschleiert deine digitale Identität durch aktive Daten-Fütterung
          (Obfuscation). Apple schützt dich passiv – wir schlagen aktiv zurück.
        </p>
      </div>
    </section>
  );
}
