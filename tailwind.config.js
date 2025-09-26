/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/mobile/app/**/*.{js,ts,jsx,tsx}",
    "./packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")], // ✅ RN only
  theme: { extend: {} },
  plugins: [],
};
