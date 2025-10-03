/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // 👈 obey system/browser automatically
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#28aae2",
        secondary: "#e63946",
        background: "#ffffff",
        surface: "#f9f9f9",
        border: "#e5e7eb",
        text: {
          primary: "#111827",
          secondary: "#374151",
          muted: "#6b7280",
        },
        gray: "#9ca3af",
        error: "#F14141",
        success: "#2F9B65",
      },
      fontFamily: {
        quicksand: ["Quicksand-Regular", "sans-serif"],
        "quicksand-bold": ["Quicksand-Bold", "sans-serif"],
        "quicksand-semibold": ["Quicksand-SemiBold", "sans-serif"],
        "quicksand-light": ["Quicksand-Light", "sans-serif"],
        "quicksand-medium": ["Quicksand-Medium", "sans-serif"],
      },
    },
  },
  plugins: [],
};
