
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          hover: "hsl(var(--primary-hover) / <alpha-value>)",
          pressed: "hsl(var(--primary-pressed) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          hover: "hsl(var(--surface-hover) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        highlight: {
          DEFAULT: "hsl(var(--highlight) / <alpha-value>)",
          foreground: "hsl(var(--highlight-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "hsl(var(--brand) / <alpha-value>)",
          soft: "hsl(var(--brand-soft) / <alpha-value>)",
          "soft-foreground": "hsl(var(--brand-soft-foreground) / <alpha-value>)",
          // legacy home-page palette
          lightest: '#e3fef7', light: '#77b0aa', dark: '#135d66', darkest: '#003c43',
        },
        icon: "hsl(var(--icon) / <alpha-value>)",
        "input-border": "hsl(var(--input-border) / <alpha-value>)",
        surface: { DEFAULT: "hsl(var(--surface) / <alpha-value>)", hover: "hsl(var(--surface-hover) / <alpha-value>)", active: "hsl(var(--surface-active) / <alpha-value>)" },
        success: { DEFAULT: "hsl(var(--success) / <alpha-value>)", bg: "hsl(var(--success-bg) / <alpha-value>)" },
        warning: { DEFAULT: "hsl(var(--warning) / <alpha-value>)", bg: "hsl(var(--warning-bg) / <alpha-value>)" },
        error: { DEFAULT: "hsl(var(--error) / <alpha-value>)", bg: "hsl(var(--error-bg) / <alpha-value>)" },
        info: { DEFAULT: "hsl(var(--info) / <alpha-value>)", bg: "hsl(var(--info-bg) / <alpha-value>)" },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
      },
      fontFamily: {
        'display': ['Inter', 'Noto Sans Hebrew', 'system-ui', 'sans-serif'],
        'sans': ['Inter', 'Noto Sans Hebrew', 'system-ui', 'sans-serif'],
        'friendly': ['Inter', 'Noto Sans Hebrew', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'youtube-title': ['14px', '20px'],
        'youtube-small': ['13px', '18px'],
      },
      keyframes: {
        "gentle-fade": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.02)" },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        "pulse-slow": {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.5' }
        },
        "pulse-slower": {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.2)', opacity: '0.4' }
        },
        "search-outline": {
          "0%": { 
            "background-position": "0% 0%"
          },
          "100%": {
            "background-position": "300% 0%"
          }
        },
        "spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        "bounce-small": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10%)" }
        },
        "first": {
          "0%": { transform: "translateY(-30%) translateX(-30%) rotate(0deg)" },
          "100%": { transform: "translateY(30%) translateX(30%) rotate(180deg)" }
        },
        "second": {
          "0%": { transform: "translateY(-30%) translateX(30%) rotate(0deg)" },
          "100%": { transform: "translateY(30%) translateX(-30%) rotate(180deg)" }
        },
        "third": {
          "0%": { transform: "translateY(30%) translateX(-30%) rotate(0deg)" },
          "100%": { transform: "translateY(-30%) translateX(30%) rotate(180deg)" }
        },
        "fourth": {
          "0%": { transform: "translateY(30%) translateX(30%) rotate(0deg)" },
          "100%": { transform: "translateY(-30%) translateX(-30%) rotate(180deg)" }
        },
        "fifth": {
          "0%": { transform: "translateY(0%) translateX(0%) rotate(0deg)" },
          "100%": { transform: "translateY(-30%) translateX(30%) rotate(90deg)" }
        }
      },
      animation: {
        "gentle-fade": "gentle-fade 0.5s ease-in-out forwards",
        "fadeIn": "fadeIn 0.6s ease-out forwards",
        "scaleIn": "scaleIn 0.6s ease-out forwards",
        "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-slower": "pulse-slower 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "search-outline": "search-outline 4s linear infinite",
        "spin": "spin 1.2s linear infinite",
        "spin-slow": "spin 2s linear infinite",
        "bounce-small": "bounce-small 1.5s ease-in-out infinite",
        "first": "first 15s linear infinite",
        "second": "second 20s linear infinite",
        "third": "third 25s linear infinite",
        "fourth": "fourth 22s linear infinite",
        "fifth": "fifth 18s linear infinite"
      },
      boxShadow: {
        raised: "var(--shadow-raised)",
        overlay: "var(--shadow-overlay)",
      },
      borderRadius: {
        badge: "var(--radius-badge)",
        control: "var(--radius-control)",
        card: "var(--radius-card)",
        dialog: "var(--radius-dialog)",
        circle: "var(--radius-circle)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ],
} satisfies Config;
