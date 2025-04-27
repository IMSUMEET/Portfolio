/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';
import { config } from 'dotenv';

// Load Environment Variables
config();

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ], 
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        primary_light: "var(--color-primary-light)",
        secondary_light: "var(--color-secondary-light)"
      }
    },
  },
  plugins: [
    plugin(function ({addBase}) {
      addBase({
        ":root": {
          // getting variables from .env
          "--color-primary": process.env.VITE_COLOR_PRIMARY,
          "--color-secondary": process.env.VITE_COLOR_SECONDARY,
          "--color-accent": process.env.VITE_COLOR_ACCENT,
          "--color-primary-light": process.env.VITE_COLOR_PRIMARY_LIGHT,
          "--color-secondary-light": process.env.VITE_COLOR_SECONDARY_LIGHT
        }
      })
    })
  ],
}

