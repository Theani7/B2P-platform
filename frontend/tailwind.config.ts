import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
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