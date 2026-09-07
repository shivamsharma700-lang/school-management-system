/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#041614",
          900: "#06251f",
          800: "#0a332c",
          700: "#11443b",
          600: "#1a5a4d",
        },
        forest: {
          700: "#0c6b45",
          600: "#12885a",
          500: "#16a34a",
          50: "#ecf8f1",
        },
        accent: {
          700: "#0f5132",
          600: "#14663a",
          500: "#1b7a46",
          100: "#d8f3e3",
          50: "#ecf8f1",
        },
        gilt: {
          600: "#c5a059",
          500: "#c9a227",
          400: "#d4b76a",
        },
        canvas: "#eef3f0",
        line: "#dde5df",
      },
      fontFamily: {
        sans: ["'Manrope'", "Segoe UI", "sans-serif"],
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(4, 24, 15, 0.04), 0 10px 28px rgba(4, 24, 15, 0.05)",
        pop: "0 18px 44px rgba(4, 24, 15, 0.12)",
        soft: "0 8px 24px rgba(4, 24, 15, 0.08)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s infinite",
      },
    },
  },
  plugins: [],
};
