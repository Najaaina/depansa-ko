export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const API_ENDPOINTS = {
  LOGIN: "/auth/sign-in",
  REGISTER: "/auth/sign-up",
  GOOGLE_AUTH: "/auth/google",
  PING: "/ping",
  WALLETS: "/account/:accountId/wallet",
  WALLET_TRANSACTIONS: "/account/:accountId/wallet/:walletId/transaction",
  TRANSACTIONS: "/account/:accountId/transaction",
  LABELS: "/account/:accountId/label",
  GET_ALL_GOALS: "/account/:accountId/goal",
  GOALS: "/account/:accountId/wallet/:walletId/goal",
  RESET_PASSWORD: "/auth/reset-password",
} as const;
