import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#7F77DD",
          "purple-50": "#EEEDFE",
          "purple-900": "#3C3489",
          teal: "#1D9E75",
          "teal-50": "#E1F5EE",
          "teal-900": "#085041",
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