/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // 👈 manual class-based control
  content: [
    "./apps/mobile/app/**/*.{js,ts,jsx,tsx}",
    "./packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "./apps/web/app/**/*.{js,ts,jsx,tsx}", // 👈 ensure web app is scanned
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
