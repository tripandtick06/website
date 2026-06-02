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
        // booking.com-tarzi parlak mavi — link / ikincil aksiyon / review-skor / info.
        // Logo navy+orange'a ucuncu rol olarak eklendi. CTA degil (CTA = accent).
        booking: {
          DEFAULT: "#006ce4",
          50: "#E6F1FE",
          100: "#CCE3FD",
          500: "#006ce4",
          600: "#0059C2",
          700: "#004596",
        },
        success: { DEFAULT: "#22C55E", light: "#4ADE80" },
        warning: { DEFAULT: "#F59E0B", light: "#FBBF24" },
        danger: { DEFAULT: "#EF4444", light: "#F87171" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        // booking-density: daha sıkı köşeler. Mevcut xl/2xl/3xl KORUNUR (200+ sayfa bagli).
        lg2: "10px",
        booking: "8px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 4px 16px rgba(0,0,0,0.08)",
        elevated: "0 10px 40px rgba(0,0,0,0.12)",
        glow: "0 4px 16px rgba(255,107,53,0.35)",
        // booking property-card golgesi: navy-tonlu, pure-black degil (impeccable).
        "booking-card": "0 1px 2px rgba(26,43,107,0.06), 0 4px 12px rgba(26,43,107,0.08)",
        "booking-hover": "0 6px 24px rgba(26,43,107,0.14)",
        // emil/impeccable focus ring — booking-blue.
        "focus-ring": "0 0 0 3px rgba(0,108,228,0.35)",
      },
      // emil: built-in easing zayif; guclu custom curve'ler.
      transitionTimingFunction: {
        "out-strong": "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out-strong": "cubic-bezier(0.77, 0, 0.175, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        // emil: scale(0)'dan asla; scale(0.96)+opacity. <300ms, ease-out.
        "scale-in": "scaleIn 0.18s cubic-bezier(0.23, 1, 0.32, 1)",
        "slide-up-fade": "slideUpFade 0.22s cubic-bezier(0.23, 1, 0.32, 1)",
        shimmer: "shimmer 1.4s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUpFade: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
