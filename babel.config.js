module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@components": "./src/components",
            "@hooks": "./src/hooks",
            "@services": "./src/services",
            "@stores": "./src/stores",
            "@lib": "./src/lib",
            "@types": "./src/types",
            "@constants": "./src/constants",
          },
        },
      ],
    ],
  };
};
