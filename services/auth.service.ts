import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api.config";
import type {
  LoginRequest,
  RegisterRequest,
  UserWithApiKey,
  ApiError,
  AuthResponse,
  RegisterResponse,
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

  private mapAuthResponse(data: AuthResponse): UserWithApiKey {
    return {
      id: data.account.id,
      username: data.account.username,
      apiKey: data.token,
    };
  }

  private mapRegisterResponse(data: RegisterResponse) {
    return {
      id: data.id,
      username: data.username,
    };
  }
  async login(credentials: LoginRequest): Promise<UserWithApiKey> {
    const data = await this.fetchApi<AuthResponse>(API_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return this.mapAuthResponse(data);
  }

  async register(userData: RegisterRequest): Promise<UserWithApiKey> {
    const data = await this.fetchApi<RegisterResponse>(API_ENDPOINTS.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return this.mapRegisterResponse(data);
  }
}

export const authService = new AuthService();
