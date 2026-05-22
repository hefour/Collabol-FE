import { api } from '../lib/api';
import type { ProjectMember } from '../types';

// ─── 백엔드 응답 타입 ──────────────────────────────────────────────────────────

export type TeamMemberRole = 'MEMBER' | 'LEADER';

export interface TeamMemberResponse {
  userId: number;
  name: string;
  email: string;
  department: string;
  role: TeamMemberRole;
}

// ─── 타입 변환 ────────────────────────────────────────────────────────────────

export function toProjectMember(r: TeamMemberResponse): ProjectMember {
  return {
    userId: String(r.userId),
    name: r.name,
    role: r.role === 'LEADER' ? '리더' : '멤버',
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const teamApi = {
  join: (inviteCode: string) =>
    api.post<TeamMemberResponse>(`/invitations/join/${inviteCode}`),

  members: (projectId: number) =>
    api.get<TeamMemberResponse[]>(`/projects/${projectId}/members`),

  updateRole: (projectId: number, userId: number, role: TeamMemberRole) =>
    api.patch<TeamMemberResponse>(`/projects/${projectId}/members/${userId}/role`, { role }),

  remove: (projectId: number, userId: number) =>
    api.del<void>(`/projects/${projectId}/members/${userId}`),
};
