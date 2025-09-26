const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Watch monorepo packages
config.watchFolders = [path.resolve(__dirname, "../../packages")];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(__dirname, "../../node_modules"),
];

config.resolver.alias = {
  ...(config.resolver.alias || {}),
  "@repo/ui": path.resolve(__dirname, "../../packages/ui/src"),
  "@repo/store": path.resolve(__dirname, "../../packages/store"),
  "@repo/types": path.resolve(__dirname, "../../packages/types"),
  "@repo/lib": path.resolve(__dirname, "../../packages/lib"),
};

// Ensure React singletons
config.resolver.extraNodeModules = {
  react: path.resolve(__dirname, "node_modules/react"),
  "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
  "react-native": path.resolve(__dirname, "node_modules/react-native"),

  // 👇 Fix: lucide-react on mobile actually points to lucide-react-native
  "lucide-react": require.resolve("lucide-react-native"),
};

module.exports = withNativeWind(config, { input: "./app/global.css" });
