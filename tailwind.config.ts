import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1A2B6B",
          light: "#2A3F9F",
          dark: "#0F1B4D",
          50: "#EEF0F9",
          100: "#D5DAF0",
          500: "#1A2B6B",
          600: "#152358",
          700: "#0F1B4D",
        },
        accent: {
          DEFAULT: "#FF6B35",
          light: "#FF8C5A",
          dark: "#E55A28",
          50: "#FFF3ED",
          100: "#FFE4D5",
          500: "#FF6B35",
          600: "#E55A28",
        },
        success: { DEFAULT: "#22C55E", light: "#4ADE80" },
        warning: { DEFAULT: "#F59E0B", light: "#FBBF24" },
        danger: { DEFAULT: "#EF4444", light: "#F87171" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 4px 16px rgba(0,0,0,0.08)",
        elevated: "0 10px 40px rgba(0,0,0,0.12)",
        glow: "0 4px 16px rgba(255,107,53,0.35)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
