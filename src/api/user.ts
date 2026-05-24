import { api } from '../lib/api';

export interface UserMeResponse {
  id: number;
  name: string;
  email: string;
  department: string;
  bio: string;
}

export const userApi = {
  me: () => api.get<UserMeResponse>('/users/me'),
  updateMe: (bio: string) => api.patch<UserMeResponse>('/users/me', { bio }),
};
