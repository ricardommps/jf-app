// types/crypto.d.ts
declare module "react-native-crypto-js" {
  export interface WordArray {
    words: number[];
    sigBytes: number;
    toString(encoder?: any): string;
  }

  export interface CipherParams {
    ciphertext: WordArray;
    key?: WordArray;
    iv?: WordArray;
    algorithm?: any;
    mode?: any;
    padding?: any;
    blockSize?: number;
    formatter?: any;
  }

  export namespace enc {
    export const Hex: {
      stringify(wordArray: WordArray): string;
      parse(hexStr: string): WordArray;
    };
    export const Utf8: {
      stringify(wordArray: WordArray): string;
      parse(utf8Str: string): WordArray;
    };
    export const Base64: {
      stringify(wordArray: WordArray): string;
      parse(base64Str: string): WordArray;
    };
  }

  export namespace AES {
    export function encrypt(
      message: string | WordArray,
      key: string | WordArray,
      options?: any
    ): CipherParams;

    export function decrypt(
      ciphertext: string | CipherParams,
      key: string | WordArray,
      options?: any
    ): WordArray;
  }

  export function SHA256(message: string | WordArray): WordArray;
  export function SHA1(message: string | WordArray): WordArray;
  export function MD5(message: string | WordArray): WordArray;

  export namespace mode {
    export const CBC: any;
    export const CFB: any;
    export const CTR: any;
    export const ECB: any;
    export const OFB: any;
  }

  export namespace pad {
    export const Pkcs7: any;
    export const AnsiX923: any;
    export const Iso10126: any;
    export const NoPadding: any;
    export const ZeroPadding: any;
  }

  const CryptoJS: {
    enc: typeof enc;
    AES: typeof AES;
    SHA256: typeof SHA256;
    SHA1: typeof SHA1;
    MD5: typeof MD5;
    mode: typeof mode;
    pad: typeof pad;
  };

  export default CryptoJS;
}
