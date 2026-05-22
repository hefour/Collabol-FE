import { api } from '../lib/api';
import type { Project, ProjectStatus } from '../types';

// ─── 백엔드 응답 타입 ──────────────────────────────────────────────────────────

export interface ProjectResponse {
  id: number;
  name: string;
  description: string;
  status: string;
  statusLabel: string;
  ownerId: number;
  ownerName: string;
  editable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InviteCodeResponse {
  inviteCode: string;
}

// ─── 타입 변환 ────────────────────────────────────────────────────────────────

function mapStatus(s: string): ProjectStatus {
  const map: Record<string, ProjectStatus> = {
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    RECRUITING: 'recruiting',
    EVALUATION_PENDING: 'completed',
    EVALUATION_COMPLETED: 'completed',
    in_progress: 'in_progress',
    completed: 'completed',
    recruiting: 'recruiting',
  };
  return map[s] ?? 'in_progress';
}

export function toProject(r: ProjectResponse): Project {
  return {
    id: String(r.id),
    title: r.name,
    description: r.description,
    status: mapStatus(r.status),
    ownerId: String(r.ownerId),
    members: [],
    tags: [],
    startDate: r.createdAt.slice(0, 10),
    createdAt: r.createdAt,
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const projectsApi = {
  list: () => api.get<ProjectResponse[]>('/projects'),

  get: (id: number) => api.get<ProjectResponse>(`/projects/${id}`),

  create: (name: string, description: string) =>
    api.post<ProjectResponse>('/projects', { name, description }),

  update: (id: number, name: string, description: string) =>
    api.put<ProjectResponse>(`/projects/${id}`, { name, description }),

  delete: (id: number) => api.del<void>(`/projects/${id}`),

  complete: (id: number) =>
    api.put<ProjectResponse>(`/projects/${id}/complete`, {}),

  getInviteCode: (id: number) =>
    api.get<InviteCodeResponse>(`/projects/${id}/invite-code`),

  regenerateInviteCode: (id: number) =>
    api.post<InviteCodeResponse>(`/projects/${id}/invite-code/regenerate`),
};
