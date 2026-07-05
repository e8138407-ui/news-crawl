import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#0f1117",
          900: "#151824",
          800: "#1a1e2b",
          700: "#20263a",
          600: "#2a3149",
        },
        copper: {
          400: "#e0a458",
          500: "#c98a4b",
          600: "#a86f3a",
        },
        teal: {
          400: "#4fd1c5",
          500: "#38b8ac",
        },
        brick: {
          400: "#e2645a",
          500: "#c94f46",
        },
        warmgray: {
          300: "#c2c6ce",
          400: "#9aa0ad",
          500: "#767c8a",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
