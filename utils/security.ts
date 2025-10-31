import * as SecureStore from "expo-secure-store";

/* -------------------------------------------------------------------------- */
/*                               CONFIGURAÇÕES                                */
/* -------------------------------------------------------------------------- */

export const SECURITY_CONFIG = {
  PASSWORD_EXPIRY_HOURS: 24, // validade da senha
  MAX_LOGIN_ATTEMPTS: 5, // tentativas antes do bloqueio
  LOCKOUT_DURATION_MINUTES: 30, // tempo de bloqueio
  SALT: "JF_BANK_SECURE_2024",
} as const;

/* -------------------------- Keys do SecureStore -------------------------- */
export const ENCRYPTED_PASSWORD_KEY = "encrypted_password";
export const PASSWORD_TIMESTAMP_KEY = "password_timestamp";
export const LOGIN_ATTEMPTS_KEY = "login_attempts";
export const LOCKOUT_TIMESTAMP_KEY = "lockout_timestamp";
export const BIOMETRIC_TOKEN_KEY = "biometric_access_token";
export const BIOMETRIC_CPF_KEY = "biometric_cpf";

/* -------------------------------------------------------------------------- */
/*                               FUNÇÕES DE HASH                              */
/* -------------------------------------------------------------------------- */

export function createHash(input: string): string {
  let hash = 0;
  if (input.length === 0) return hash.toString();
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // 32 bits
  }
  return Math.abs(hash).toString();
}

/* -------------------------------------------------------------------------- */
/*                       Base64 + UTF-8 helpers (robustos)                    */
/* -------------------------------------------------------------------------- */

function encodeBase64(input: string): string {
  const utf8 = unescape(encodeURIComponent(input)); // bytes 0..255
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  let i = 0;

  while (i < utf8.length) {
    const byte1 = utf8.charCodeAt(i++);
    const byte2 = i < utf8.length ? utf8.charCodeAt(i++) : NaN;
    const byte3 = i < utf8.length ? utf8.charCodeAt(i++) : NaN;

    const triplet =
      (byte1 << 16) |
      ((isNaN(byte2) ? 0 : byte2) << 8) |
      (isNaN(byte3) ? 0 : byte3);

    output += chars.charAt((triplet >> 18) & 0x3f);
    output += chars.charAt((triplet >> 12) & 0x3f);
    output += isNaN(byte2) ? "=" : chars.charAt((triplet >> 6) & 0x3f);
    output += isNaN(byte3) ? "=" : chars.charAt(triplet & 0x3f);
  }

  return output;
}

function decodeBase64(encoded: string): string {
  if (!encoded) return "";

  encoded = encoded.replace(/\s+/g, "");
  encoded = encoded.replace(/[^A-Za-z0-9+/=]/g, "");

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let bytes: number[] = [];
  let i = 0;

  while (i < encoded.length) {
    const e1 = chars.indexOf(encoded.charAt(i++));
    const e2 = chars.indexOf(encoded.charAt(i++));
    const e3 = chars.indexOf(encoded.charAt(i++));
    const e4 = chars.indexOf(encoded.charAt(i++));

    const A = e1 < 0 ? 64 : e1;
    const B = e2 < 0 ? 64 : e2;
    const C = e3 < 0 ? 64 : e3;
    const D = e4 < 0 ? 64 : e4;

    const triple = (A << 18) | (B << 12) | ((C & 63) << 6) | (D & 63);

    const byte1 = (triple >> 16) & 0xff;
    const byte2 = (triple >> 8) & 0xff;
    const byte3 = triple & 0xff;

    bytes.push(byte1);
    if (C !== 64) bytes.push(byte2);
    if (D !== 64) bytes.push(byte3);
  }

  try {
    const decoded = decodeURIComponent(
      bytes.map((b) => "%" + ("0" + b.toString(16)).slice(-2)).join("")
    );
    return decoded;
  } catch (err) {
    console.warn(
      "decodeBase64: falha no decodeURIComponent, retornando bytes simples",
      err
    );
    return bytes.map((b) => String.fromCharCode(b)).join("");
  }
}

/* -------------------------------------------------------------------------- */
/*                         GERAÇÃO DE CHAVE E SALT                            */
/* -------------------------------------------------------------------------- */

function generateKey(cpf: string): string {
  if (!cpf) throw new Error("CPF vazio ao gerar key");
  return createHash(cpf + SECURITY_CONFIG.SALT);
}

/* -------------------------------------------------------------------------- */
/*                        CRIPTOGRAFIA E DESCRIPTOGRAFIA                      */
/* -------------------------------------------------------------------------- */

export function encryptPassword(password: string, cpf: string): string {
  const key = generateKey(cpf);
  const timestamp = Date.now();
  const checksum = createHash(password + cpf + timestamp.toString());

  const data = JSON.stringify({ password, timestamp, checksum });

  let encrypted = "";
  for (let i = 0; i < data.length; i++) {
    const dataChar = data.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(dataChar ^ keyChar);
  }

  return encodeBase64(encrypted);
}

export function decryptPassword(
  encryptedPassword: string,
  cpf: string
): string | null {
  if (!encryptedPassword) {
    console.error("decryptPassword: encryptedPassword vazio");
    return null;
  }
  if (!cpf) {
    console.error("decryptPassword: cpf inválido");
    return null;
  }

  try {
    const key = generateKey(cpf);
    const normalized = encryptedPassword.replace(/\s+/g, "");
    const encrypted = decodeBase64(normalized);

    if (!encrypted || encrypted.length === 0) {
      console.error("decryptPassword: decodeBase64 retornou vazio");
      return null;
    }

    let decrypted = "";
    for (let i = 0; i < encrypted.length; i++) {
      const encChar = encrypted.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(encChar ^ keyChar);
    }

    const head = decrypted.slice(0, 4);
    if (!decrypted || head.indexOf("{") === -1) {
      console.error(
        "decryptPassword: saída XOR não parece JSON. head:",
        head,
        "preview:",
        decrypted.slice(0, 120)
      );
      throw new Error("Decrypted payload não é JSON");
    }

    const data = JSON.parse(decrypted);
    const expectedChecksum = createHash(
      data.password + cpf + data.timestamp.toString()
    );

    if (data.checksum !== expectedChecksum) {
      console.error("decryptPassword: checksum inválido", {
        expectedChecksum,
        found: data.checksum,
      });
      throw new Error("Dados corrompidos (checksum mismatch)");
    }

    return data.password;
  } catch (error) {
    console.error("Erro na descriptografia:", error);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                       FUNÇÕES DE PERSISTÊNCIA (SecureStore)                */
/* -------------------------------------------------------------------------- */

export async function saveEncryptedPassword(password: string, cpf: string) {
  try {
    const encryptedPassword = encryptPassword(password, cpf);
    await SecureStore.setItemAsync(ENCRYPTED_PASSWORD_KEY, encryptedPassword);
    await SecureStore.setItemAsync(
      PASSWORD_TIMESTAMP_KEY,
      Date.now().toString()
    );
  } catch (error) {
    console.error("Erro ao salvar senha criptografada:", error);
  }
}

export async function getDecryptedPassword(
  cpf: string
): Promise<string | null> {
  try {
    let encrypted = await SecureStore.getItemAsync(ENCRYPTED_PASSWORD_KEY);
    const timestampStr = await SecureStore.getItemAsync(PASSWORD_TIMESTAMP_KEY);

    if (!encrypted || !timestampStr) {
      return null;
    }

    encrypted = encrypted.trim();
    const timestamp = parseInt(timestampStr);
    const hoursDiff = (Date.now() - timestamp) / (1000 * 60 * 60);

    if (hoursDiff >= SECURITY_CONFIG.PASSWORD_EXPIRY_HOURS) {
      await clearSavedPassword();
      return null;
    }

    return decryptPassword(encrypted, cpf);
  } catch (error) {
    console.error("Erro ao recuperar senha:", error);
    return null;
  }
}

export async function clearSavedPassword() {
  try {
    await SecureStore.deleteItemAsync(ENCRYPTED_PASSWORD_KEY);
    await SecureStore.deleteItemAsync(PASSWORD_TIMESTAMP_KEY);
  } catch (error) {
    console.error("Erro ao limpar senha salva:", error);
  }
}

/* -------------------------------------------------------------------------- */
/*                   CONTROLE DE TENTATIVAS E BLOQUEIO                        */
/* -------------------------------------------------------------------------- */

export async function incrementLoginAttempts(): Promise<number> {
  const attemptsStr = await SecureStore.getItemAsync(LOGIN_ATTEMPTS_KEY);
  const attempts = attemptsStr ? parseInt(attemptsStr) + 1 : 1;
  await SecureStore.setItemAsync(LOGIN_ATTEMPTS_KEY, attempts.toString());

  if (attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
    await SecureStore.setItemAsync(
      LOCKOUT_TIMESTAMP_KEY,
      Date.now().toString()
    );
  }

  return attempts;
}

export async function resetLoginAttempts() {
  await SecureStore.deleteItemAsync(LOGIN_ATTEMPTS_KEY);
  await SecureStore.deleteItemAsync(LOCKOUT_TIMESTAMP_KEY);
}

export async function isAccountLocked(): Promise<boolean> {
  const lockTimestampStr = await SecureStore.getItemAsync(
    LOCKOUT_TIMESTAMP_KEY
  );

  if (!lockTimestampStr) return false;

  const lockTimestamp = parseInt(lockTimestampStr);
  const minutesDiff = (Date.now() - lockTimestamp) / (1000 * 60);

  if (minutesDiff >= SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES) {
    await resetLoginAttempts();
    return false;
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/*                       BIOMETRIA (armazenamento seguro)                     */
/* -------------------------------------------------------------------------- */

export async function saveBiometricToken(token: string, cpf: string) {
  await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token);
  await SecureStore.setItemAsync(BIOMETRIC_CPF_KEY, cpf);
}

export async function getBiometricToken(): Promise<{
  token: string | null;
  cpf: string | null;
}> {
  const token = await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
  const cpf = await SecureStore.getItemAsync(BIOMETRIC_CPF_KEY);
  return { token, cpf };
}

export async function clearBiometricData() {
  await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
  await SecureStore.deleteItemAsync(BIOMETRIC_CPF_KEY);
}
