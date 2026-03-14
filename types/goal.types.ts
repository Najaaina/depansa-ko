export interface CreationGoal {
  accountId: string;
  name: string;
  amount: 0;
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

export type GOAL_TYPE_ICONS = "STAR" | "HEART" | "CASH";

export interface GetAllGoalResponse {
  values: Goal[];
  count: number;
}

export interface ApiError {
  message: string;
  status?: number;
}
