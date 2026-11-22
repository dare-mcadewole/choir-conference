import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#121B2E",
        wine: "#74222C",
        gold: "#D8B36A",
        mist: "#F6F4EE",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Arial", "sans-serif"],
      },
      boxShadow: { glow: "0 20px 70px rgba(18,27,46,.14)" },
    },
  },
  plugins: [],
} satisfies Config;
