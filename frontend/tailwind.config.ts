import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // B2P Connect design tokens
        stone: {
          50: "#FAFAF8",
          100: "#E9E7E3",
          900: "#292521",
        },
        brand: {
          purple: "#7F77DD",
          "purple-50": "#EEEDFE",
          "purple-900": "#3C3489",
          indigo: "#5B4FCF",
          "indigo-50": "#EEECFB",
          "indigo-900": "#2D2580",
          teal: "#1D9E75",
          "teal-50": "#E1F5EE",
          "teal-900": "#085041",
          coral: "#C44A2A",
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