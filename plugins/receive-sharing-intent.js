const { withAndroidManifest } = require("@expo/config-plugins");

const withReceiveSharingIntent = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    // Encontrar a MainActivity
    const mainActivity = androidManifest.manifest.application[0].activity.find(
      (activity) => activity.$["android:name"] === ".MainActivity"
    );

    if (mainActivity) {
      // Garantir que intent-filter existe
      if (!mainActivity["intent-filter"]) {
        mainActivity["intent-filter"] = [];
      }

      // Adicionar intent filter para compartilhamento de texto
      const shareIntentFilter = {
        action: [
          {
            $: {
              "android:name": "android.intent.action.SEND",
            },
          },
        ],
        category: [
          {
            $: {
              "android:name": "android.intent.category.DEFAULT",
            },
          },
        ],
        data: [
          {
            $: {
              "android:mimeType": "text/plain",
            },
          },
        ],
      };

      // Verificar se já existe um intent filter similar
      const existingFilter = mainActivity["intent-filter"].find(
        (filter) =>
          filter.action &&
          filter.action.some(
            (action) =>
              action.$["android:name"] === "android.intent.action.SEND"
          )
      );

      if (!existingFilter) {
        mainActivity["intent-filter"].push(shareIntentFilter);
      }
    }

    return config;
  });
};

module.exports = withReceiveSharingIntent;
