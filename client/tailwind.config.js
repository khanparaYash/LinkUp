import animate from "tw-animate-css"


/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",  // 👈 enable class-based dark mode
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#6366F1", // Indigo
          dark: "#4F46E5",
        },
      },
    },
  },
  plugins: [animate,],
};
