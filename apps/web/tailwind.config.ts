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
        annapoorna: {
          50: "#fdf8f4",
          100: "#faeee4",
          200: "#f4dac7",
          300: "#ecbe9f",
          400: "#e19a71",
          500: "#d87a4c",
          600: "#c96137",
          700: "#a74b2c",
          800: "#873e2a",
          900: "#6e3525",
        },
        sage: {
          50: "#f4f7f4",
          100: "#e6ede6",
          200: "#ceddce",
          300: "#abc3ac",
          400: "#80a283",
          500: "#5e8462",
          600: "#49694d",
          700: "#3b533e",
          800: "#324334",
          900: "#2a372c",
        },
        sand: {
          50: "#faf9f6",
          100: "#f3f0ea",
          200: "#e6e0d3",
          300: "#d4cab6",
          400: "#beae96",
          500: "#aa977e",
          600: "#9c866f",
          700: "#826e5c",
          800: "#6b5b4e",
          900: "#584b42",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
