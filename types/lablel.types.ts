export interface CreationLabel {
  name: string;
  color: string;
  iconRef: string;
}

export interface Label extends CreationLabel {
  id: string;
}

export type LabelType = "WORK"|"SCHOOL"|"TRANSPORT"|"HEALTH"| "MISC"| "FOOD"|"ENTERTAINEMENT"|"SHOPPING";

// export interface UpdateWallet extends CreationWallet {
//   id: string;
//   accountId: string;
//   isActive: boolean;
// }

// export interface Wallet extends UpdateWallet {
//   amount: number;
//   walletAutomaticIncome: WalletAutomaticIncome;
// }

// export interface WalletFilters {
//   isActive?: boolean;
//   walletType?: WalletType;
//   name?: string;
// }

// export interface PaginationResult<T> {
//   values: T[];
//   count: number;
//   page: number;
//   pageSize: number;
//   totalPages: number;
// }

export interface GetAllLabelResponse {
  values: Label[];
  count: number;
}

export interface ApiError {
  message: string;
  status?: number;
}
