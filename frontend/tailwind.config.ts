import type { Config } from "tailwindcss";
const cssColorVar = (variableName: string) =>
  `rgb(var(--${variableName}) / <alpha-value>)`;
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: cssColorVar("bg"),
        card: cssColorVar("card"),
        fg: cssColorVar("fg"),
        mute: cssColorVar("mute"),
        accent: cssColorVar("accent"),
        accent2: cssColorVar("accent2"),
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
