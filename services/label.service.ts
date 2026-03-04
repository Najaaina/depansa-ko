import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api.config";
import { storageService } from "@/services/storage.service";
import type { Label, GetAllLabelsResponse, ApiError } from "@/types/label.types";

class LabelService {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const apiKey = await storageService.getApiKey();
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...options.headers,
        },
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

  async update(accountId: string, label: Label): Promise<Label> {
    if (!label.id) throw new Error("Label ID is required for update");
    const endpoint = `${API_ENDPOINTS.LABELS.replace(":accountId", accountId)}/${label.id}`;
    return await this.fetchApi<Label>(endpoint, {
      method: "PUT",
      body: JSON.stringify(label),
    });
  }

  async delete(accountId: string, labelId: string): Promise<void> {
    const endpoint = `${API_ENDPOINTS.LABELS.replace(":accountId", accountId)}/${labelId}`;
    await this.fetchApi<void>(endpoint, {
      method: "DELETE",
    });
  }
}

export const labelService = new LabelService();
