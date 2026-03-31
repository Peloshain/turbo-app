import * as SecureStore from "expo-secure-store";

const SESSION_KEY = "wardrobe_auth_session";

// ─── secureStorage ────────────────────────────────────────
// Persists the session token in the device keychain.
// Encrypted at rest on both iOS (Keychain) and Android (Keystore).
export const secureStorage = {
  async save(token: string): Promise<void> {
    await SecureStore.setItemAsync(SESSION_KEY, token);
  },

  async get(): Promise<string | null> {
    return SecureStore.getItemAsync(SESSION_KEY);
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
