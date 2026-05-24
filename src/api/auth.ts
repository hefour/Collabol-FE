import { api } from '../lib/api';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  sendEmail: (email: string) =>
    api.post<void>('/auth/email/send', { email }),

  verifyEmail: (email: string, code: string) =>
    api.post<void>('/auth/email/verify', { email, code }),

  signup: (data: { email: string; password: string; name: string; department: string }) =>
    api.post<void>('/auth/signup', data),

  login: (email: string, password: string) =>
    api.post<TokenResponse>('/auth/login', { email, password }),

  refresh: (refreshToken: string) =>
    api.post<TokenResponse>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    api.post<void>('/auth/logout', { refreshToken }),
};
