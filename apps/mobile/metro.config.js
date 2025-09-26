// apps/mobile/metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// 👀 1. Make Metro aware of your shared `packages/` folder
config.watchFolders = [
  path.resolve(__dirname, "../../packages"),
];

// 👀 2. Fix node_modules resolution (local + root)
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(__dirname, "../../node_modules"),
];

// 👀 3. Set up aliases for your workspace packages
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  "@repo/ui": path.resolve(__dirname, "../../packages/ui/src"),
  "@repo/store": path.resolve(__dirname, "../../packages/store"),
  "@repo/types": path.resolve(__dirname, "../../packages/types"),
  "@repo/lib": path.resolve(__dirname, "../../packages/lib"),
};

// 👀 4. Force Metro to use the same React deps as the app
config.resolver.extraNodeModules = {
  react: require.resolve("react"),
  "react-dom": require.resolve("react-dom"),
  "react-native": require.resolve("react-native"),
};

module.exports = withNativeWind(config, { input: "./app/globals.css" });
