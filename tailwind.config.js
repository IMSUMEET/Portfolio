/** @type {import('tailwindcss').Config} */
import plugin from "tailwindcss/plugin";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        primary_light: "var(--color-primary-light)",
        secondary_light: "var(--color-secondary-light)",
        clay: {
          purple: "var(--clay-purple)",
          lavender: "var(--clay-lavender)",
          peach: "var(--clay-peach)",
          orange: "var(--clay-orange)",
          blue: "var(--clay-blue)",
          green: "var(--clay-green)",
          yellow: "var(--clay-yellow)",
        },
      },
      borderOpacity: {
        3: "0.03",
        8: "0.08",
      },
      backgroundOpacity: {
        3: "0.03",
        6: "0.06",
        8: "0.08",
      },
      transitionDuration: {
        400: "400ms",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        ":root": {
          "--font-sans": "Inter, system-ui, sans-serif",
          "--color-primary": "#eef2f7",
          "--color-secondary": "#1f2937",
          "--color-accent": "#6366f1",
          "--color-primary-light": "#ffffff",
          "--color-secondary-light": "#f6f8fb",
        },
      });
    }),
  ],
};
