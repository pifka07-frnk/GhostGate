"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("success");
    setEmail("");
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="max-w-xl mx-auto">
        <div className="glass-card p-8 md:p-10 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            Join the Ghost-List
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            Erhalte Early Access und Updates – keine Spam, nur Geisterpost.
          </p>

          {status === "success" ? (
            <div className="flex items-center justify-center gap-2 text-ghost-neon py-4">
              <Check className="w-5 h-5" />
              <span className="font-medium">Du bist auf der Liste. Wir melden uns.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                required
                disabled={status === "loading"}
                className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-ghost-anthracite border border-ghost-border text-white placeholder-zinc-500 focus:outline-none focus:border-ghost-neon/50 focus:ring-1 focus:ring-ghost-neon/30 transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3 rounded-xl bg-ghost-neon text-ghost-black font-semibold hover:bg-ghost-neon-dim hover:shadow-neon transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  "Wird gesendet…"
                ) : (
                  <>
                    <span>Join the Ghost-List</span>
                    <Send className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
