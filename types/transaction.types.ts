import type { Label } from "./label.types";

export type TransactionType = "IN" | "OUT";
export type TransactionTypeDisplay = "INCOME" | "EXPENSE";

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  date: string;
  labels?: Label[];
}

export interface CreationTransaction {
  walletId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  date: string;
  labels: { id: string }[];
}

export interface UpdateTransaction extends CreationTransaction {
  id: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  walletId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetAllTransactionsResponse {
  values: Transaction[];
  count: number;
}

export interface ApiError {
  message: string;
  status?: number;
}
