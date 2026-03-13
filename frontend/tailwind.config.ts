import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        turf: {
          950: "#0a0f0d",
          900: "#0f1612",
          800: "#141d18",
          700: "#1a261f",
          600: "#243028",
          500: "#2e3d33",
        },
        accent: {
          DEFAULT: "#22c55e",
          hover: "#16a34a",
          muted: "#15803d",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
