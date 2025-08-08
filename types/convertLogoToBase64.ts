// utils/convertLogoToBase64.ts
// Run this script once to get your logo as base64

import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";

export async function convertLogoToBase64(): Promise<string> {
  try {
    const asset: Asset = Asset.fromModule(
      require("../assets/images/jf_icone_v1.png")
    );

    if (!asset.downloaded) {
      await asset.downloadAsync();
    }

    if (asset.localUri) {
      const logoBase64: string = await FileSystem.readAsStringAsync(
        asset.localUri,
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      return logoBase64;
    } else {
      throw new Error("Could not get local URI for asset");
    }
  } catch (error: any) {
    console.error("Error converting logo to base64:", error);
    throw error;
  }
}
