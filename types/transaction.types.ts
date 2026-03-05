export type TransactionType = "INCOME" | "EXPENSE";

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  date: string;
}

export interface CreationTransaction {
  walletId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  date: string;
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
