export type WalletType = "CASH" | "MOBILE_MONEY" | "BANK" | "DEBT";

export type AutomaticIncomeType = "NOT_SPECIFIED" | "MENSUAL";

export interface WalletAutomaticIncome {
  type: AutomaticIncomeType;
  amount: number;
  paymentDay?: number;
}

export interface CreationWallet {
  name: string;
  description?: string;
  type: WalletType;
  color?: string;
  iconRef?: string;
}

export interface UpdateWallet extends CreationWallet {
  id: string;
  accountId: string;
  isActive: boolean;
}

export interface Wallet extends UpdateWallet {
  amount: number;
  walletAutomaticIncome: WalletAutomaticIncome;
}

export interface WalletFilters {
  isActive?: boolean;
  walletType?: WalletType;
  name?: string;
}

export interface PaginationResult<T> {
  values: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetAllWalletsResponse {
  values: Wallet[];
  count: number;
}

export interface ApiError {
  message: string;
  status?: number;
}
