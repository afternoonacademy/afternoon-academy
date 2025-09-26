/* eslint-env node */
module.exports = {
  plugins: {
    tailwindcss: { config: "./tailwind.config.js" }, // 👈 still points local
    autoprefixer: {},
  },
};
