export interface CreationGoal {
  accountId: string;
  goalName: string;
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

// export type LabelType =
//   | "WORK"
//   | "SCHOOL"
//   | "TRANSPORT"
//   | "HEALTH"
//   | "MISC"
//   | "FOOD"
//   | "ENTERTAINEMENT"
//   | "SHOPPING";

export interface GetAllGoalResponse {
  values: Goal[];
  count: number;
}

export interface ApiError {
  message: string;
  status?: number;
}
