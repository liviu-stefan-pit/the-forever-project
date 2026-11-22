/** Theme tokens: Horde red + bronze on a dark canvas (docs/DESIGN.md §1); Alliance blue + silver for the landing page. */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      screens: { "3xl": "1800px" },
      fontFamily: {
        sans: ['"Source Sans 3"', "Segoe UI", "system-ui", "sans-serif"],
        display: ["Cinzel", "Georgia", "serif"],
        mono: ["ui-monospace", "Cascadia Mono", "Consolas", "monospace"],
      },
      colors: {
        canvas: "#120c0a",
        frame: "#1c150f",
        stroke: "#6b542e",
        ink: "#f3ead7",
        muted: "#c4b496",
        horde: {
          300: "#e8b4b0",
          400: "#c45c54",
          500: "#9b2c2c",
          600: "#7f1d1d",
          700: "#5c1414",
          900: "#2a0a0a",
        },
        bronze: {
          300: "#ffe9a3",
          400: "#e0b85a",
          500: "#c6a15a",
          700: "#6b542e",
          900: "#3d2a10",
        },
        /** Alliance (landing page only for now): night blue, royal blue, silver, pale gold. */
        alliance: {
          300: "#9cc3f5",
          400: "#5b8fd9",
          500: "#1f4e9c",
          600: "#173b78",
          700: "#102a56",
          900: "#0a1020",
        },
        silver: {
          300: "#eef2f7",
          400: "#c9d3e0",
          500: "#9aa8bb",
          700: "#4a5668",
        },
        paleGold: "#e8d18a",
        parchment: { DEFAULT: "#e6d3a8", ink: "#3a2a16" },
        /** Semantic colours: always pair with an icon or a label. */
        done: "#3d9a5a",
        warn: "#e0943a",
        danger: "#d44a3a",
        tip: "#7eb3e0",
        profession: "#c084fc",
        /** Rich-text segment colours (RichText segment kinds), tuned for dark bronze frames. */
        rt: {
          friendly: "#5dff6a",
          warn: "#ff9a3c",
          enemy: "#ff5a4a",
          buy: "#ffd100",
          loot: "#c084fc",
          pick: "#7eb3e0",
        },
      },
      minHeight: { touch: "36px" },
      minWidth: { touch: "36px" },
      boxShadow: {
        card: "0 10px 24px -12px rgba(0,0,0,0.75)",
        glow: "0 0 0 1px rgba(198,161,90,0.45), 0 8px 24px -12px rgba(0,0,0,0.8)",
      },
    },
  },
  plugins: [],
};
