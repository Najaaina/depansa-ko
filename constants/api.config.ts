export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const API_ENDPOINTS = {
  LOGIN: "/auth/sign-in",
  REGISTER: "/auth/sign-up",
  PING: "/ping",
  WALLETS: "/account/:accountId/wallet",
  TRANSACTIONS: "/account/:accountId/transaction",
  LABELS: "/account/:accountId/label",
  GOALS: "/account/:accountId/goal",
} as const;
