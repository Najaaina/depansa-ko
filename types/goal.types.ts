export interface CreationGoal {
  accountId: string;
  name: string;
  amount: number;
  walletId: string;
  startingDate: string;
  endingDate: string;
  color: string;
  iconRef: string;
}

export interface Goal extends CreationGoal {
  id: string;
}

export interface UpdateGoal extends Goal {
  accountId: string;
}

export type GoalIcon = "STAR" | "HEART" | "CASH";

export interface GetAllGoalResponse {
  values: Goal[];
  count: number;
}

export interface ApiError {
  message: string;
  status?: number;
}
