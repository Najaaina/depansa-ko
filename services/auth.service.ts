import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api.config";
import type {
  LoginRequest,
  RegisterRequest,
  UserWithApiKey,
  ApiError,
} from "@/types/api.types";

class AuthService {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message:
            errorData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
        } as ApiError;
      }

      return await response.json();
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: "Network error. Please check your connection.",
      } as ApiError;
    }
  }

  async login(credentials: LoginRequest): Promise<UserWithApiKey> {
    return this.fetchApi<UserWithApiKey>(API_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<UserWithApiKey> {
    return this.fetchApi<UserWithApiKey>(API_ENDPOINTS.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }
}

export const authService = new AuthService();
