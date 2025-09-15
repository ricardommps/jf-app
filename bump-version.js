const fs = require("fs");

const appJsonPath = "./app.json";
const appConfig = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));

const versionParts = appConfig.expo.version.split(".");
const major = parseInt(versionParts[0]);
const minor = parseInt(versionParts[1]);
let patch = parseInt(versionParts[2]);

// incrementa patch
patch += 1;

const newVersion = `${major}.${minor}.${patch}`;

// atualiza os campos
appConfig.expo.version = newVersion;
appConfig.expo.ios.buildNumber = String(
  parseInt(appConfig.expo.ios.buildNumber || "0") + 1
);
appConfig.expo.android.versionCode =
  parseInt(appConfig.expo.android.versionCode || 0) + 1;
appConfig.expo.ios.runtimeVersion = newVersion;
appConfig.expo.android.runtimeVersion = newVersion;

fs.writeFileSync(appJsonPath, JSON.stringify(appConfig, null, 2));

console.log(`✅ Versão atualizada para ${newVersion}`);
console.log(`iOS buildNumber: ${appConfig.expo.ios.buildNumber}`);
console.log(`Android versionCode: ${appConfig.expo.android.versionCode}`);
