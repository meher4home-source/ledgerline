import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#12172A",
          50: "#F4F5F8",
          100: "#E4E6EE",
          200: "#C3C7D9",
          300: "#9AA1BD",
          400: "#6B7295",
          500: "#454C6E",
          600: "#2E3350",
          700: "#1F2440",
          800: "#161A33",
          900: "#12172A",
          950: "#0B0E1C",
        },
        parchment: {
          DEFAULT: "#F7F4EC",
          100: "#FFFFFF",
          200: "#F7F4EC",
          300: "#EFE9DB",
        },
        brass: {
          DEFAULT: "#B08D3F",
          400: "#C6A356",
          500: "#B08D3F",
          600: "#8F7130",
        },
        forest: {
          DEFAULT: "#3D6650",
          500: "#3D6650",
        },
        oxblood: {
          DEFAULT: "#7A3B34",
          500: "#7A3B34",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
