import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { UserWithApiKey, GoogleUser } from "@/types/api.types";

const STORAGE_KEYS = {
  API_KEY: "api_key",
  USER_DATA: "user_data",
  AUTH_PROVIDER: "auth_provider",
} as const;

const isSecureStoreAvailable = (): boolean => {
  return (
    Platform.OS !== "web" &&
    !!SecureStore &&
    typeof SecureStore.getItemAsync === "function"
  );
};

export class StorageService {
  async saveUserSession(userData: UserWithApiKey): Promise<void> {
    if (!isSecureStoreAvailable()) {
      console.warn("SecureStore not available on this platform");
      return;
    }
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.API_KEY, String(userData.apiKey));
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify({ id: userData.id, username: userData.username })
      );
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_PROVIDER, "local");
    } catch (error) {
      console.error("Error saving user session:", error);
      throw new Error("Failed to save user session");
    }
  }

  async saveGoogleSession(googleUser: GoogleUser): Promise<void> {
    if (!isSecureStoreAvailable()) {
      console.warn("SecureStore not available on this platform");
      return;
    }
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.API_KEY, googleUser.id);
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify({ id: googleUser.id, username: googleUser.name })
      );
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_PROVIDER, "google");
    } catch (error) {
      console.error("Error saving Google session:", error);
      throw new Error("Failed to save Google session");
    }
  }


  async getApiKey(): Promise<string | null> {
    if (!isSecureStoreAvailable()) return null;
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.API_KEY);
    } catch (error) {
      console.error("Error getting API key:", error);
      return null;
    }
  }

  async getUserData(): Promise<Omit<UserWithApiKey, "apiKey"> | null> {
    if (!isSecureStoreAvailable()) return null;
    try {
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  async getAuthProvider(): Promise<"local" | "google" | null> {
    if (!isSecureStoreAvailable()) return null;
    try {
      const provider = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_PROVIDER);
      return provider as "local" | "google" | null;
    } catch (error) {
      console.error("Error getting auth provider:", error);
      return null;
    }
  }

  async clearSession(): Promise<void> {
    if (!isSecureStoreAvailable()) return;
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.API_KEY);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_PROVIDER);
    } catch (error) {
      console.error("Error clearing session:", error);
      throw new Error("Failed to clear session");
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const apiKey = await this.getApiKey();
    return apiKey !== null;
  }
}

export const storageService = new StorageService();