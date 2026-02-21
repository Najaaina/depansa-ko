export interface User {
  id: string;
  username: string;
  email: string;
}

export interface UserWithApiKey extends User {
  apiKey: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
