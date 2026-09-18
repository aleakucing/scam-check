/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-dim": "#e5d3fa",
        "surface-container-highest": "#ecdcff",
        "secondary-container": "#c5afff",
        "tertiary-container": "#506066",
        "primary-container": "#681bff",
        "on-surface-variant": "#494457",
        "surface-bright": "#fef7ff",
        "on-secondary-fixed-variant": "#4e3a82",
        "status-scam-bg": "#FEECEE",
        "status-safe-green": "#0F9D58",
        "outline": "#7a7489",
        "on-secondary-container": "#523e86",
        "inverse-surface": "#372b48",
        "surface-variant": "#ecdcff",
        "secondary-fixed": "#e9ddff",
        "border-subtle": "#E5E7EB",
        "surface-tint": "#6920ff",
        "surface-container-high": "#f1e3ff",
        "on-tertiary": "#ffffff",
        "surface-ice-blue": "#DDEEF5",
        "primary-fixed-dim": "#cdbdff",
        "on-secondary": "#ffffff",
        "surface": "#fef7ff",
        "surface-container": "#f5eaff",
        "tertiary": "#39484e",
        "inverse-primary": "#cdbdff",
        "primary-fixed": "#e8deff",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "status-safe-bg": "#E6F4EA",
        "on-tertiary-fixed-variant": "#3a494f",
        "outline-variant": "#cbc3da",
        "on-primary-fixed-variant": "#5000d0",
        "on-primary-container": "#dcd0ff",
        "on-secondary-fixed": "#210754",
        "on-background": "#211632",
        "on-tertiary-container": "#c9dae1",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#20005f",
        "tertiary-fixed-dim": "#b8c9d0",
        "brand-violet-hover": "#5512D6",
        "on-error-container": "#93000a",
        "on-surface": "#211632",
        "surface-container-lowest": "#ffffff",
        "on-tertiary-fixed": "#0e1e23",
        "brand-violet-vibrant": "#681BFF",
        "primary": "#4e00cd",
        "border-purple-subtle": "#EBE4FF",
        "error": "#ba1a1a",
        "surface-container-low": "#faf0ff",
        "tertiary-fixed": "#d4e5ec",
        "brand-indigo-hero": "#1C004F",
        "background": "#fef7ff",
        "secondary": "#66529b",
        "secondary-fixed-dim": "#cfbcff",
        "inverse-on-surface": "#f8edff",
        "status-scam-red": "#E52534"
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        full: "9999px"
      },
      spacing: {
        "space-md": "1rem",
        "space-sm": "0.5rem",
        "gutter": "1.5rem",
        "space-xl": "2.5rem",
        "space-lg": "1.5rem",
        "space-xs": "0.25rem",
        "margin": "2rem"
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    }
  },
  plugins: []
};
