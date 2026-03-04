import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api.config";
import { storageService } from "@/services/storage.service";
import type {
  Transaction,
  CreationTransaction,
  UpdateTransaction,
  TransactionFilters,
  GetAllTransactionsResponse,
  ApiError,
} from "@/types/transaction.types";

class TransactionService {
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
    filters: TransactionFilters = {},
    page: number = 1,
    pageSize: number = 10,
  ): Promise<GetAllTransactionsResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());
    
    if (filters.type) params.append("type", filters.type);
    if (filters.walletId) params.append("walletId", filters.walletId);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const endpoint = `${API_ENDPOINTS.TRANSACTIONS.replace(":accountId", accountId)}?${params.toString()}`;
    return await this.fetchApi<GetAllTransactionsResponse>(endpoint);
  }

  async getByWallet(
    accountId: string,
    walletId: string,
    filters: TransactionFilters = {},
    page: number = 1,
    pageSize: number = 20,
  ): Promise<GetAllTransactionsResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());
    params.append("walletId", walletId);
    
    if (filters.type) params.append("type", filters.type);
    if (filters.startDate) params.append("startingDate", filters.startDate);
    if (filters.endDate) params.append("endingDate", filters.endDate);

    const endpoint = `${API_ENDPOINTS.TRANSACTIONS.replace(":accountId", accountId)}?${params.toString()}`;
    return await this.fetchApi<GetAllTransactionsResponse>(endpoint);
  }

  async create(accountId: string, walletId: string, transaction: CreationTransaction): Promise<Transaction> {
    const endpoint = API_ENDPOINTS.WALLET_TRANSACTIONS
      .replace(":accountId", accountId)
      .replace(":walletId", walletId);
    return await this.fetchApi<Transaction>(endpoint, {
      method: "POST",
      body: JSON.stringify(transaction),
    });
  }

  async update(accountId: string, walletId: string, transaction: UpdateTransaction): Promise<Transaction> {
    const endpoint = `${API_ENDPOINTS.WALLET_TRANSACTIONS
      .replace(":accountId", accountId)
      .replace(":walletId", walletId)}/${transaction.id}`;
    return await this.fetchApi<Transaction>(endpoint, {
      method: "PUT",
      body: JSON.stringify(transaction),
    });
  }

  async delete(accountId: string, walletId: string, transactionId: string): Promise<void> {
    const endpoint = `${API_ENDPOINTS.WALLET_TRANSACTIONS
      .replace(":accountId", accountId)
      .replace(":walletId", walletId)}/${transactionId}`;
    await this.fetchApi<void>(endpoint, {
      method: "DELETE",
    });
  }
}

export const transactionService = new TransactionService();
