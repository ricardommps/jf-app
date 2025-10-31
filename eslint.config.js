const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  globalIgnores(["dist/*"]),
  expoConfig,
  {
    // aqui você pode adicionar suas regras personalizadas
    rules: {
      // exemplo: desativar react/display-name
      "react/display-name": "off",
    },
    // se quiser aplicar apenas a certos arquivos:
    // files: ["**/*.ts", "**/*.tsx", ...],
  },
]);
