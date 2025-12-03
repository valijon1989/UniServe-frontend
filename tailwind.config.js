/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          soft: "#dbeafe"
        },
        dark: "#050816",
        card: "#0f172a",
        uniBg: "#050816",
        uniCard: "#0f172a",
        uniAccent: "#38bdf8",
        uniAccentSoft: "#0ea5e9",
        uniSoft: "#1e293b"
      }
    }
  },
  plugins: [],
};
