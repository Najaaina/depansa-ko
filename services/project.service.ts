import { API_BASE_URL } from "@/constants/api.config";
import { storageService } from "@/services/storage.service";
import type {
  Project,
  CreationProject,
  ProjectTransaction,
  CreationProjectTransaction,
  ProjectStatistics,
} from "@/types/project.types";

const BASE = (accountId: string) => `/account/${accountId}/project`;
const PROJECT = (accountId: string, projectId: string) => `${BASE(accountId)}/${projectId}`;
const TX = (accountId: string, projectId: string) => `${PROJECT(accountId, projectId)}/transaction`;

class ProjectService {
  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
      };
    }

    return await response.json();
  }

  private async fetchBinary(endpoint: string): Promise<Blob> {
    const apiKey = await storageService.getApiKey();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) throw { message: `HTTP error! status: ${response.status}`, status: response.status };
    return await response.blob();
  }

  // Projects
  async getAll(accountId: string): Promise<Project[]> {
    return await this.fetchApi<Project[]>(BASE(accountId));
  }

  async getOne(accountId: string, projectId: string): Promise<Project> {
    return await this.fetchApi<Project>(PROJECT(accountId, projectId));
  }

  async create(accountId: string, project: CreationProject): Promise<Project> {
    return await this.fetchApi<Project>(BASE(accountId), {
      method: "POST",
      body: JSON.stringify(project),
    });
  }

  async update(accountId: string, projectId: string, project: CreationProject): Promise<Project> {
    return await this.fetchApi<Project>(PROJECT(accountId, projectId), {
      method: "PUT",
      body: JSON.stringify(project),
    });
  }

  async delete(accountId: string, projectId: string): Promise<Project> {
    return await this.fetchApi<Project>(PROJECT(accountId, projectId), { method: "DELETE" });
  }

  async archive(accountId: string, projectId: string): Promise<Project> {
    return await this.fetchApi<Project>(`${PROJECT(accountId, projectId)}/archive`, { method: "POST" });
  }

  // Project transactions
  async getAllTransactions(accountId: string, projectId: string): Promise<ProjectTransaction[]> {
    return await this.fetchApi<ProjectTransaction[]>(TX(accountId, projectId));
  }

  async getOneTransaction(accountId: string, projectId: string, transactionId: string): Promise<ProjectTransaction> {
    return await this.fetchApi<ProjectTransaction>(`${TX(accountId, projectId)}/${transactionId}`);
  }

  async createTransaction(accountId: string, projectId: string, transaction: CreationProjectTransaction): Promise<ProjectTransaction> {
    return await this.fetchApi<ProjectTransaction>(TX(accountId, projectId), {
      method: "POST",
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(accountId: string, projectId: string, transactionId: string, transaction: CreationProjectTransaction): Promise<ProjectTransaction> {
    return await this.fetchApi<ProjectTransaction>(`${TX(accountId, projectId)}/${transactionId}`, {
      method: "PUT",
      body: JSON.stringify(transaction),
    });
  }

  async deleteTransaction(accountId: string, projectId: string, transactionId: string): Promise<void> {
    await this.fetchApi<void>(`${TX(accountId, projectId)}/${transactionId}`, { method: "DELETE" });
  }

  // Statistics
  async getStatistics(accountId: string, projectId: string): Promise<ProjectStatistics> {
    return await this.fetchApi<ProjectStatistics>(`${PROJECT(accountId, projectId)}/statistics`);
  }

  // PDFs
  async downloadStatisticsPDF(accountId: string, projectId: string): Promise<Blob> {
    return await this.fetchBinary(`${PROJECT(accountId, projectId)}/pdf/statistics`);
  }

  async downloadInvoicePDF(accountId: string, projectId: string): Promise<Blob> {
    return await this.fetchBinary(`${PROJECT(accountId, projectId)}/pdf/invoice`);
  }

  async downloadSummaryPDF(accountId: string, projectId: string): Promise<Blob> {
    return await this.fetchBinary(`${PROJECT(accountId, projectId)}/pdf/summary`);
  }
}

export const projectService = new ProjectService();