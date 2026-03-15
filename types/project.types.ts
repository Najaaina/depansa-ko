export interface CreationProject {
  name: string;
  description?: string;
  initialBudget: number;
  color?: string;
  iconRef?: string;
}

export interface Project extends CreationProject {
  id: string;
  accountId: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export interface CreationProjectTransaction {
  name: string;
  description?: string;
  estimatedCost: number;
  realCost?: number;
  walletId?: string;
}

export interface ProjectTransaction extends CreationProjectTransaction {
  id: string;
  projectId: string;
  accountId: string;
  walletId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStatistics {
  project: Project;
  totalEstimatedCost: number;
  totalRealCost: number;
  remainingBudget: number;
}