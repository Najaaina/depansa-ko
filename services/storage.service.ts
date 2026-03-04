import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { UserWithApiKey } from "@/types/api.types";

const STORAGE_KEYS = {
  API_KEY: "api_key",
  USER_DATA: "user_data",
} as const;

const isSecureStoreAvailable = (): boolean => {
  return Platform.OS !== "web" && 
         SecureStore && 
         typeof SecureStore.getItemAsync === "function";
};

const webStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};

export class StorageService {
  async saveUserSession(userData: UserWithApiKey): Promise<void> {
    const dataToSave = JSON.stringify({
      id: userData.id,
      username: userData.username
    });
    console.log("Saving session - API Key:", userData.apiKey ? "exists" : "null");

    if (isSecureStoreAvailable()) {
      try {
        await SecureStore.setItemAsync(STORAGE_KEYS.API_KEY, String(userData.apiKey));
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, dataToSave);
        console.log("Saved to SecureStore");
      } catch (error) {
        console.error("Error saving user session:", error);
        throw new Error("Failed to save user session");
      }
    } else {
      webStorage.setItem(STORAGE_KEYS.API_KEY, String(userData.apiKey));
      webStorage.setItem(STORAGE_KEYS.USER_DATA, dataToSave);
    }
  }

  async getApiKey(): Promise<string | null> {
    if (isSecureStoreAvailable()) {
      try {
        const key = await SecureStore.getItemAsync(STORAGE_KEYS.API_KEY);
        console.log("getApiKey from SecureStore:", key ? "exists" : "null");
        return key;
      } catch (error) {
        console.error("Error getting API key:", error);
        return null;
      }
    }
    return webStorage.getItem(STORAGE_KEYS.API_KEY);
  }

  async getUserData(): Promise<Omit<UserWithApiKey, "apiKey"> | null> {
    if (isSecureStoreAvailable()) {
      try {
        const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
        return userData ? JSON.parse(userData) : null;
      } catch (error) {
        console.error("Error getting user data:", error);
        return null;
      }
    }
    const userData = webStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  async clearSession(): Promise<void> {
    if (isSecureStoreAvailable()) {
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.API_KEY);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
      } catch (error) {
        console.error("Error clearing session:", error);
        throw new Error("Failed to clear session");
      }
    } else {
      webStorage.removeItem(STORAGE_KEYS.API_KEY);
      webStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const apiKey = await this.getApiKey();
    return apiKey !== null;
  }
}

export const storageService = new StorageService();
