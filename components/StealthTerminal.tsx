"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type StealthTerminalEntry = {
  id: string;
  text: string;
};

export type StealthTerminalProps = {
  open: boolean;
  entries: StealthTerminalEntry[];
  onSubmit: (input: string) => void;
  onClose: () => void;
};

export default function StealthTerminal({
  open,
  entries,
  onSubmit,
  onClose,
}: StealthTerminalProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  const handleSubmit = () => {
    const value = input.trim();
    if (!value) return;
    onSubmit(value);
    setInput("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[8000] flex justify-center pointer-events-none"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          <div className="pointer-events-auto w-full max-w-5xl px-2 pb-2">
            <div className="h-[32vh] sm:h-[30vh] rounded-t-2xl border border-ghost-neon/70 bg-black/80 backdrop-blur-md shadow-[0_0_30px_rgba(0,255,136,0.35)] flex flex-col font-mono text-[11px] text-ghost-neon">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-ghost-neon/40">
                <span className="text-[10px] uppercase tracking-[0.18em] text-ghost-neon/80">
                  Stealth Terminal
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-2 py-0.5 rounded bg-ghost-neon/10 border border-ghost-neon/40 text-[10px] text-ghost-neon hover:bg-ghost-neon/20 transition-colors"
                >
                  CMD
                </button>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 px-3 py-2 overflow-y-auto scrollbar-ghost"
              >
                {entries.length === 0 ? (
                  <p className="text-zinc-500">
                    &gt; Stealth-Terminal bereit. Tippe /help für verfügbare Befehle.
                  </p>
                ) : (
                  entries.map((line) => (
                    <p key={line.id} className="whitespace-pre-wrap break-words">
                      {line.text}
                    </p>
                  ))
                )}
              </div>

              <div className="px-3 py-1.5 border-t border-ghost-neon/40 flex items-center gap-2">
                <span className="text-[10px] text-ghost-neon/80 shrink-0">
                  ghost@terminal:~$
                </span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      onClose();
                    }
                  }}
                  className="flex-1 bg-transparent outline-none border-none text-[11px] text-ghost-neon placeholder:text-zinc-600"
                  placeholder="/scan, /vault, /wipe, /status, /clear"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

