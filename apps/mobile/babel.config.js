// apps/mobile/babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      // 👇 NativeWind works as a preset in SDK 50+
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin", // must be last
      [
        "module-resolver",
        {
          alias: {
            "@": "./", // resolves "@/..." imports
          },
        },
      ],
    ],
  };
};
