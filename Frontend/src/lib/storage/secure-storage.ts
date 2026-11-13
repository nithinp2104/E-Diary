import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Persistent storage for secrets (iOS Keychain / Android Keystore-backed).
 *
 * - Values are never written to AsyncStorage or any other plain-text store.
 * - On web, SecureStore is unavailable and browser storage is not safe for tokens,
 *   so values live in memory only (the user signs in again after a reload).
 * - An in-memory mirror keeps the session usable for the current app run if a
 *   keychain write fails, instead of losing a freshly rotated token.
 */
const memory = new Map<string, string>();
const persistent = Platform.OS !== 'web';

const options: SecureStore.SecureStoreOptions = {
  // Readable after the first unlock (so background refresh works) and never migrated to another device.
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    const cached = memory.get(key);
    if (cached !== undefined || !persistent) return cached ?? null;

    try {
      const value = await SecureStore.getItemAsync(key, options);
      if (value !== null) memory.set(key, value);
      return value;
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    memory.set(key, value);
    if (!persistent) return;

    try {
      await SecureStore.setItemAsync(key, value, options);
    } catch {
      // Intentionally not logging the value. The session continues from memory for this run.
      console.warn(`[secure-storage] Failed to persist "${key}"; it will not survive an app restart.`);
    }
  },

  async deleteItem(key: string): Promise<void> {
    memory.delete(key);
    if (!persistent) return;

    try {
      await SecureStore.deleteItemAsync(key, options);
    } catch {
      console.warn(`[secure-storage] Failed to delete "${key}".`);
    }
  },
};
