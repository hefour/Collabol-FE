import { api } from '../lib/api';
import type { Task, TaskStatus } from '../types';

// ─── 백엔드 응답 타입 ──────────────────────────────────────────────────────────

export interface TaskAssignee {
  userId: number;
  name: string;
}

export interface TaskResponse {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  status: string;
  statusLabel: string;
  assignees: TaskAssignee[];
  createdAt: string;
  updatedAt: string;
}

// ─── 타입 변환 ────────────────────────────────────────────────────────────────

function mapTaskStatus(s: string): TaskStatus {
  const map: Record<string, TaskStatus> = {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    DONE: 'done',
    todo: 'todo',
    in_progress: 'in_progress',
    done: 'done',
  };
  return map[s] ?? 'todo';
}

export function toTask(r: TaskResponse): Task {
  return {
    id: String(r.id),
    projectId: String(r.projectId),
    title: r.title,
    description: r.description,
    status: mapTaskStatus(r.status),
    priority: 'medium',
    assigneeId: r.assignees[0] ? String(r.assignees[0].userId) : undefined,
    createdAt: r.createdAt,
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface TaskCreateRequest {
  title: string;
  description?: string;
  assigneeIds: number[];
}

export const tasksApi = {
  list: (projectId: number) =>
    api.get<TaskResponse[]>(`/projects/${projectId}/tasks`),

  get: (projectId: number, taskId: number) =>
    api.get<TaskResponse>(`/projects/${projectId}/tasks/${taskId}`),

  create: (projectId: number, data: TaskCreateRequest) =>
    api.post<TaskResponse>(`/projects/${projectId}/tasks`, data),

  update: (projectId: number, taskId: number, data: TaskCreateRequest) =>
    api.put<TaskResponse>(`/projects/${projectId}/tasks/${taskId}`, data),

  updateStatus: (projectId: number, taskId: number, status: string) =>
    api.patch<TaskResponse>(`/projects/${projectId}/tasks/${taskId}/status`, { status }),

  delete: (projectId: number, taskId: number) =>
    api.del<void>(`/projects/${projectId}/tasks/${taskId}`),
};
