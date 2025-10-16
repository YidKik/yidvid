
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
        // Custom brand colors for home page only
        'brand': {
          'lightest': '#e3fef7',
          'light': '#77b0aa',
          'dark': '#135d66',
          'darkest': '#003c43',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#ea384c",
          hover: "#dc2626",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f1f5f9",
          hover: "#e2e8f0",
          foreground: "#0f172a",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#f1f5f9",
          foreground: "#0f172a",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
        'friendly': ['Quicksand', 'sans-serif'],
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
      borderRadius: {
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
