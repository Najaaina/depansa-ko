import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api.config";
import { storageService } from "@/services/storage.service";
import type {
  Label,
  GetAllLabelResponse,
  ApiError,
  CreationLabel,
  UpdateLabel,
} from "@/types/lablel.types";

class LabelService {
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
          message: errorData.message || `HTTP error! status: ${response.status}`,
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
  ): Promise<GetAllLabelsResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());
    
    const endpoint = `${API_ENDPOINTS.LABELS.replace(":accountId", accountId)}?${params.toString()}`;
    return await this.fetchApi<GetAllLabelsResponse>(endpoint);
  }

  async create(accountId: string, label: Label): Promise<Label> {
    const endpoint = API_ENDPOINTS.LABELS.replace(":accountId", accountId);
    return await this.fetchApi<Label>(endpoint, {
      method: "POST",
      body: JSON.stringify(label),
    });
  }

  async update(accountId: string, label: UpdateLabel): Promise<Label> {
    const endpoint = `${API_ENDPOINTS.LABELS.replace(":accountId", accountId)}/${label.id}`;
    return await this.fetchApi<Label>(endpoint, {
      method: "PUT",
      body: JSON.stringify(label),
    });
  }

  async archive(accountId: string, labelId: string): Promise<Label> {
    const endpoint = `${API_ENDPOINTS.LABELS.replace(":accountId", accountId)}/${labelId}/archive`;
    return await this.fetchApi<Label>(endpoint, {
      method: "POST",
    });
  }
}

export const labelService = new LabelService();
