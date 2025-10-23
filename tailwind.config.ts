// tailwind.config.ts (or .js)
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";
import type { Config } from "tailwindcss";

export default {
  darkMode: "class",                            // <-- important
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",   // <-- add components
    "./content/**/*.{mdx,md}",
  ],
  plugins: [typography, animate],
} satisfies Config;
