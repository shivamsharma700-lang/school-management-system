/** @type {import('tailwindcss').Config} */

/**
 * Design tokens — "Ink & Saffron".
 *
 * The semantic names (ink / forest / gilt / ivory / canvas / line) are kept so
 * every existing component restyles from this one file instead of needing a
 * sweep through the markup. Only the values changed.
 *
 * The repeated complaint across three palettes was "washed out", so this one is
 * built for contrast first: a near-black ink carries structure, surfaces are
 * near-white, and a single saffron accent does all the shouting. Colour comes
 * from the photography, which is now graded for punch (scripts/score-images.mjs).
 *
 *   forest → near-black ink     (primary: navigation, buttons, headings)
 *   gilt   → saffron / marigold (the one accent — never a large surface)
 *   ivory  → near-white, faint warm cast (page and card grounds)
 *   ink    → true near-black    (text and dark sections)
 *
 * Contrast: forest-800 on ivory-50 ≈ 16:1, ink-900 on white ≈ 18:1,
 * gilt-700 on ivory-50 ≈ 4.6:1 (accent text only, never body copy).
 */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      /**
       * Tailwind only generates a `/NN` colour-opacity utility when NN is in this
       * scale. Fine-grained values (hairline borders at /6, /8, /12 and scrim
       * stops at /72, /88) silently produced NO rule, which left gradients with
       * an undefined `--tw-gradient-stops` and therefore no overlay at all.
       * Every step used anywhere in src/ is registered here.
       */
      opacity: {
        2: "0.02",
        3: "0.03",
        6: "0.06",
        8: "0.08",
        9: "0.09",
        12: "0.12",
        18: "0.18",
        22: "0.22",
        28: "0.28",
        72: "0.72",
        82: "0.82",
        88: "0.88",
        92: "0.92",
        94: "0.94",
      },
      colors: {
        /* True near-black with a faint warm cast — text, dark sections, scrims */
        ink: {
          950: "#08080A",
          900: "#111114",
          800: "#1C1C21",
          700: "#2B2B32",
          600: "#43434D",
        },
        /* Primary: near-black ink. Structure, not decoration. */
        forest: {
          900: "#08080A",
          800: "#15151A",
          700: "#26262E",
          600: "#3A3A45",
          500: "#56565F",
          100: "#E8E8EA",
          50: "#F4F4F5",
        },
        accent: {
          700: "#15151A",
          600: "#26262E",
          500: "#3A3A45",
          100: "#E8E8EA",
          50: "#F4F4F5",
        },
        /* The single accent: saffron / marigold */
        gilt: {
          700: "#9A6205",
          600: "#C98209",
          500: "#F0A500",
          400: "#FFBE3D",
        },
        /* Near-white grounds with the faintest warm cast */
        ivory: {
          50: "#FFFFFF",
          100: "#FAF9F7",
          200: "#F1EFEB",
        },
        canvas: "#FAF9F7",
        line: "#E3E0DA",
        surface: "#FFFFFF",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Manrope'", "Segoe UI", "sans-serif"],
        display: ["'Fraunces'", "'Cormorant Garamond'", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 15, 28, 0.04), 0 10px 28px rgba(20, 15, 28, 0.06)",
        pop: "0 18px 44px rgba(20, 15, 28, 0.12)",
        soft: "0 8px 24px rgba(20, 15, 28, 0.08)",
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
