// plugins/fix-firebase-pods.js
const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function fixFirebasePods(config) {
  return withDangerousMod(config, [
    "ios",
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let contents = fs.readFileSync(podfilePath, "utf-8");

      if (!contents.includes("use_frameworks!")) {
        contents = contents.replace(
          /use_expo_modules!/,
          `use_expo_modules!\n  use_frameworks! :linkage => :static\n  use_modular_headers!`
        );
      }

      // Garantir que GoogleUtilities sempre use modular headers
      if (
        !contents.includes(`pod 'GoogleUtilities', :modular_headers => true`)
      ) {
        contents = contents.replace(
          /pod 'GoogleUtilities'.*\n/,
          `pod 'GoogleUtilities', :modular_headers => true\n`
        );
      }

      fs.writeFileSync(podfilePath, contents);
      return config;
    },
  ]);
};
