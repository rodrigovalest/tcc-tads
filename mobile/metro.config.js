const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Adiciona suporte ao NativeWind
const nativeWindConfig = withNativeWind(config, { input: "./global.css" });

// Adiciona suporte ao SVG transformer + extensões de dicionário (.aff/.dic)
module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig(__dirname);

  const newAssetExts = assetExts.filter((ext) => ext !== "svg");

  return {
    ...nativeWindConfig,
    transformer: {
      ...nativeWindConfig.transformer,
      babelTransformerPath: require.resolve("react-native-svg-transformer"),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
    resolver: {
      ...nativeWindConfig.resolver,
      assetExts: assetExts.filter((ext) => !["aff", "dic", "svg"].includes(ext)),
      sourceExts: [...new Set([...sourceExts, "aff", "dic", "svg"])],
    },
  };
})();
