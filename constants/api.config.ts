export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const API_ENDPOINTS = {
  LOGIN: "/auth/sign-in",
  REGISTER: "/auth/sign-up",
  PING: "/ping",
} as const;
