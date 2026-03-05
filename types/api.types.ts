import { string } from "zod";

export interface User {
  id: string;
  username: string;
}

export interface UserWithApiKey extends User {
  apiKey: string;
}

export interface AuthResponse {
  account: {
    id: string;
    username: string;
  };
  token: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
}

export interface RegisterResult {
  id: string;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}