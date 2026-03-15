import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api.config";
import { storageService } from "@/services/storage.service";
import type {
  GetAllGoalResponse,
  Goal,
  UpdateGoal,
  ApiError,
  CreationGoal,
} from "@/types/goal.types";

class GoalService {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const apiKey = await storageService.getApiKey();
      console.log("API Key retrieved:", apiKey ? "exists" : "null");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
        console.log("Sending request to:", endpoint);
      } else {
        console.warn("No API key found!");
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
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

  async getAll(
    accountId: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<GetAllGoalResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());

    const endpoint = `${API_ENDPOINTS.GET_ALL_GOALS.replace(":accountId", accountId)}?${params.toString()}`;
    return await this.fetchApi<GetAllGoalResponse>(endpoint);
  }

  async getOne(
    accountId: string,
    walletId: string,
    goalId: string,
  ): Promise<Goal> {
    const endpoint = `${API_ENDPOINTS.GOALS.replace(":accountId", accountId).replace(":walletId", walletId)}/${goalId}`;
    return await this.fetchApi<Goal>(endpoint);
  }

  async create(goal: CreationGoal): Promise<CreationGoal> {
    const endpoint = `${API_ENDPOINTS.GOALS.replace(":accountId", goal.accountId).replace(":walletId", goal.walletId)}`;
    return await this.fetchApi<Goal>(endpoint, {
      method: "POST",
      body: JSON.stringify(goal),
    });
  }

  async update(
    accountId: string,
    walletId: string,
    goalId: string,
    data: UpdateGoal,
  ): Promise<Goal> {
    const endpoint = `${API_ENDPOINTS.GOALS.replace(":accountId", accountId).replace(":walletId", walletId)}/${goalId}`;
    return await this.fetchApi<Goal>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async archive(
    accountId: string,
    walletId: string,
    goalId: string,
  ): Promise<Goal> {
    const endpoint = `${API_ENDPOINTS.GOALS.replace(":accountId", accountId).replace(":walletId", walletId)}/${goalId}/archive`;
    return await this.fetchApi<Goal>(endpoint, {
      method: "POST",
    });
  }
}

export const goalService = new GoalService();
