import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { ApiFailure, ApiSuccess } from '@/types';

const TOKEN_KEY = 'chowsmart_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiClientError extends Error {
  code: string;
  status?: number;
  details?: unknown;

  constructor(message: string, code = 'UNKNOWN', status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const body = response.data as ApiSuccess<unknown> | ApiFailure;
    if (body && typeof body === 'object' && 'success' in body && body.success === false) {
      throw new ApiClientError(body.error.message, body.error.code, response.status, body.error);
    }
    return response;
  },
  (error: AxiosError<ApiFailure>) => {
    if (error.response?.status === 401) {
      clearToken();
    }

    const payload = error.response?.data;
    if (payload && payload.success === false && payload.error) {
      throw new ApiClientError(
        payload.error.message,
        payload.error.code,
        error.response?.status,
        payload.error
      );
    }

    throw new ApiClientError(
      error.message || 'Network request failed',
      'NETWORK_ERROR',
      error.response?.status
    );
  }
);

export async function unwrap<T>(promise: Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  const res = await promise;
  return res.data.data;
}
