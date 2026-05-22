import { api } from '../lib/api';

export interface UserMeResponse {
  id: number;
  name: string;
  email: string;
  department: string;
}

export const userApi = {
  me: () => api.get<UserMeResponse>('/users/me'),
};
