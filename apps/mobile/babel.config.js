module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel"
    ],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@repo/store": "../../packages/store",
            "@repo/types": "../../packages/types",
            "@repo/lib": "../../packages/lib",
            "@repo/ui": "../../packages/ui/src",
            "@": "./"
          }
        }
      ]
    ]
  };
};
