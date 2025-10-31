import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";

export async function convertLogoToBase64(): Promise<string> {
  try {
    const asset = Asset.fromModule(require("../assets/images/jf_icone_v1.png"));

    // Sempre baixa para garantir caminho file://
    await asset.downloadAsync();

    if (!asset.localUri) {
      throw new Error("Could not get local URI for asset");
    }

    const logoBase64 = await FileSystem.readAsStringAsync(asset.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return logoBase64;
  } catch (error) {
    console.error("Error converting logo to base64:", error);
    throw error;
  }
}
