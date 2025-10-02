const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@repo/ui",
    "@repo/store",
    "@repo/types",
    "@repo/lib",
    "@repo/scheduler", // ✅ added
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native$": require.resolve("react-native-web"),
      "react-native": require.resolve("react-native-web"),
      "@repo/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@repo/store": path.resolve(__dirname, "../../packages/store"),
      "@repo/types": path.resolve(__dirname, "../../packages/types"),
      "@repo/lib": path.resolve(__dirname, "../../packages/lib"),
      "@repo/scheduler": path.resolve(__dirname, "../../packages/scheduler"),
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
      "@repo/scheduler": "../../packages/scheduler",
    },
  },
  outputFileTracingRoot: path.join(__dirname, "../../"),

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  experimental: {
    outputFileTracingExcludes: {
      "*": ["**/page_client-reference-manifest.js"],
    },
  },

  images: {
    domains: ["snpmvvisvnrodeumewpe.supabase.co"],
  },
};

module.exports = nextConfig;
