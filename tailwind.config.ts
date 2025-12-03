import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        uniBg: "#050816",
        uniCard: "#0f172a",
        uniAccent: "#38bdf8",
        uniAccentSoft: "#0ea5e9",
        uniSoft: "#1e293b"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;
