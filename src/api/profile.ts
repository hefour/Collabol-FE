import { api } from '../lib/api';

export interface ProfileApiResponse {
  id: number;
  name: string;
  department: string;
  bio: string;
  presentationAvg: number;
  communicationAvg: number;
  collaborationAvg: number;
  sincerityAvg: number;
  planningAvg: number;
  overallAvg: number;
  reviewCount: number;
  projectCount: number;
}

export const profileApi = {
  get: (userId: string | number) => api.get<ProfileApiResponse>(`/profile/${userId}`),
};
