const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/store", "@repo/types", "@repo/lib"],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // React Native → React Native Web
      "react-native$": require.resolve("react-native-web"),
      "react-native": require.resolve("react-native-web"),
      // monorepo package aliases
      "@repo/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@repo/store": path.resolve(__dirname, "../../packages/store"),
      "@repo/types": path.resolve(__dirname, "../../packages/types"),
      "@repo/lib": path.resolve(__dirname, "../../packages/lib"),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
      "@repo/ui": "../../packages/ui/src",
      "@repo/store": "../../packages/store",
      "@repo/types": "../../packages/types",
      "@repo/lib": "../../packages/lib",
    },
  },
  outputFileTracingRoot: path.join(__dirname, "../../"), // silence lockfile warning

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    // ✅ exclude problematic manifest from tracing
    outputFileTracingExcludes: {
      "*": ["**/page_client-reference-manifest.js"],
    },
  },
};

module.exports = nextConfig;
