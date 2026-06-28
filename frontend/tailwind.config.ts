import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Design system colors
        linen: {
          canvas: "#fcfcfc",
        },
        sky: {
          wash: "#f0f4fe",
        },
        midnight: {
          ink: "#020520",
        },
        graphite: "#14141e",
        slate: "#374151",
        ash: "#696a72",
        fog: "#95959b",
        steel: "#6b7280",
        signal: {
          blue: "#145aff",
        },
        periwinkle: {
          glow: "#b6cbfd",
        },
        "hero-blue-fade": "#3b82f6",
        emerald: {
          status: "#16ca2e",
          DEFAULT: "#16ca2e",
          50: "#e6fce8",
          200: "#a0e8a5",
          600: "#16ca2e",
        },
        coral: {
          alert: "#f26052",
          DEFAULT: "#f26052",
          50: "#fce1dd",
          200: "#f8adaa",
        },
        azure: "#0099ff",
        amber: {
          tag: "#ffa64d",
          DEFAULT: "#ffa64d",
          50: "#fff1de",
          200: "#ffd68a",
          600: "#ffa64d",
          900: "#633806",
        },
        // Use brand-teal as default teal for compatibility
        teal: {
          DEFAULT: "#1D9E75",
          50: "#E1F5EE",
          200: "#a7e4d1",
          600: "#085041",
          900: "#085041",
        },
        purple: {
          50: "#EEEDFE",
          200: "#c7b4f9",
          900: "#3C3489",
        },
        "primary-action": {
          accent: "#0f1f3d",
        },
        // Legacy brand colors for compatibility
        primary: {
          DEFAULT: "#6366F1",
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        brand: {
          purple: "#7F77DD",
          "purple-50": "#EEEDFE",
          "purple-900": "#3C3489",
          teal: "#1D9E75",
          "teal-50": "#E1F5EE",
          "teal-900": "#085041",
          indigo: "#5B4FCF",
          "indigo-50": "#EEECFB",
          "indigo-900": "#2D2580",
          coral: "#D85A30",
          "coral-50": "#FAECE7",
          "coral-900": "#712B13",
          amber: "#BA7517",
          "amber-50": "#FAEEDA",
          "amber-900": "#633806",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;