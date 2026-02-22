import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ghost: {
          black: "#0a0a0b",
          anthracite: "#1a1a1e",
          surface: "#242428",
          border: "rgba(0, 255, 136, 0.15)",
          neon: "#00ff88",
          "neon-dim": "#00cc6a",
          "neon-glow": "rgba(0, 255, 136, 0.4)",
        },
      },
      backgroundImage: {
        "glass": "linear-gradient(135deg, rgba(26, 26, 30, 0.6) 0%, rgba(10, 10, 11, 0.8) 100%)",
        "glass-border": "linear-gradient(135deg, rgba(0, 255, 136, 0.1), transparent 50%)",
      },
      boxShadow: {
        "neon": "0 0 20px rgba(0, 255, 136, 0.3)",
        "neon-sm": "0 0 10px rgba(0, 255, 136, 0.2)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.4)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "ghost-hop": "ghostHop 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        ghostHop: {
          "0%, 100%": { left: "15%", top: "35%" },
          "20%": { left: "48%", top: "28%" },
          "40%": { left: "52%", top: "55%" },
          "60%": { left: "22%", top: "52%" },
          "80%": { left: "75%", top: "38%" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(0, 255, 136, 0.3)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 30px rgba(0, 255, 136, 0.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
