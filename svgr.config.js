module.exports = {
  native: true,
  typescript: true,
  dimensions: false,
  svgoConfig: {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
            cleanupIds: false,
            removeUnknownsAndDefaults: false,
          },
        },
      },
    ],
  },
}

//npx @svgr/cli bod-complet.svg --config-file svgr.config.js --out-dir svg