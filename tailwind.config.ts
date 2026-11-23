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
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      fontFamily: {
        display: ["var(--font-methane)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 70px rgba(18,27,46,.14)",
      },
      borderWidth: {
        hairline: "0.5px",
      },
    },
  },
  plugins: [],
} satisfies Config;
