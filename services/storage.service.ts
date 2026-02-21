import * as SecureStore from "expo-secure-store";
import type { UserWithApiKey } from "@/types/api.types";

const STORAGE_KEYS = {
  API_KEY: "api_key",
  USER_DATA: "user_data",
} as const;

export class StorageService {
  async saveUserSession(userData: UserWithApiKey): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.API_KEY, userData.apiKey);
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify({
          id: userData.id,
          username: userData.username,
          email: userData.email,
        }),
      );
    } catch (error) {
      console.error("Error saving user session:", error);
      throw new Error("Failed to save user session");
    }
  }

  async getApiKey(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.API_KEY);
    } catch (error) {
      console.error("Error getting API key:", error);
      return null;
    }
  }

  async getUserData(): Promise<Omit<UserWithApiKey, "apiKey"> | null> {
    try {
      const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  async clearSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.API_KEY);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
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
