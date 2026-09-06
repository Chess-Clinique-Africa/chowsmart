import { api, unwrap } from './api';
import type { AuthPayload, User } from '@/types';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  register(input: RegisterInput) {
    return unwrap<AuthPayload>(api.post('/auth/register', input));
  },
  login(input: LoginInput) {
    return unwrap<AuthPayload>(api.post('/auth/login', input));
  },
  me() {
    return unwrap<User>(api.get('/auth/me'));
  },
  logout() {
    return unwrap<{ message: string }>(api.post('/auth/logout'));
  },
};
