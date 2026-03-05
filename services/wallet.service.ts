import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api.config";
import { storageService } from "@/services/storage.service";
import type {
  Wallet,
  CreationWallet,
  UpdateWallet,
  WalletFilters,
  GetAllWalletsResponse,
  WalletAutomaticIncome,
  ApiError,
} from "@/types/wallet.types";

class WalletService {
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
    filters: WalletFilters = {},
    page: number = 1,
    pageSize: number = 10,
  ): Promise<GetAllWalletsResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());
    
    if (filters.name) params.append("name", filters.name);
    if (filters.isActive !== undefined) params.append("isActive", filters.isActive.toString());
    if (filters.walletType) params.append("walletType", filters.walletType);

    const endpoint = `${API_ENDPOINTS.WALLETS.replace(":accountId", accountId)}?${params.toString()}`;
    return await this.fetchApi<GetAllWalletsResponse>(endpoint);
  }

  async getOne(accountId: string, walletId: string): Promise<Wallet> {
    const endpoint = `${API_ENDPOINTS.WALLETS.replace(":accountId", accountId)}/${walletId}`;
    return await this.fetchApi<Wallet>(endpoint);
  }

  async create(accountId: string, wallet: CreationWallet): Promise<Wallet> {
    const endpoint = API_ENDPOINTS.WALLETS.replace(":accountId", accountId);
    return await this.fetchApi<Wallet>(endpoint, {
      method: "POST",
      body: JSON.stringify(wallet),
    });
  }

  async update(accountId: string, wallet: UpdateWallet): Promise<Wallet> {
    const endpoint = `${API_ENDPOINTS.WALLETS.replace(":accountId", accountId)}/${wallet.id}`;
    return await this.fetchApi<Wallet>(endpoint, {
      method: "PUT",
      body: JSON.stringify(wallet),
    });
  }

  async archive(accountId: string, walletId: string): Promise<Wallet> {
    const endpoint = `${API_ENDPOINTS.WALLETS.replace(":accountId", accountId)}/${walletId}/archive`;
    return await this.fetchApi<Wallet>(endpoint, {
      method: "POST",
    });
  }

  async updateAutomaticIncome(
    accountId: string,
    walletId: string,
    automaticIncome: WalletAutomaticIncome,
  ): Promise<Wallet> {
    const endpoint = `${API_ENDPOINTS.WALLETS.replace(":accountId", accountId)}/${walletId}/automaticIncome`;
    return await this.fetchApi<Wallet>(endpoint, {
      method: "PUT",
      body: JSON.stringify(automaticIncome),
    });
  }
}

export const walletService = new WalletService();
