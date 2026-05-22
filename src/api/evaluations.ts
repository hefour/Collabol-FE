import { api } from '../lib/api';
import type { Review, SkillRating } from '../types';

// ─── 백엔드 응답 타입 ──────────────────────────────────────────────────────────

export interface EvaluationUser {
  userId: number;
  name: string;
}

export interface EvaluationResponse {
  id: number;
  projectId: number;
  reviewer: EvaluationUser;
  reviewee: EvaluationUser;
  presentationScore: number;
  communicationScore: number;
  collaborationScore: number;
  sincerityScore: number;
  planningScore: number;
  averageScore: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationRequest {
  revieweeId: number;
  presentationScore: number;
  communicationScore: number;
  collaborationScore: number;
  sincerityScore: number;
  planningScore: number;
  comment?: string;
}

// ─── 타입 변환 ────────────────────────────────────────────────────────────────

export function toReview(r: EvaluationResponse): Review {
  const skillRatings: SkillRating[] = [
    { tag: '발표력',      score: r.presentationScore },
    { tag: '커뮤니케이션', score: r.communicationScore },
    { tag: '협업태도',    score: r.collaborationScore },
    { tag: '성실성',      score: r.sincerityScore },
    { tag: '기획력',      score: r.planningScore },
  ];
  return {
    id: String(r.id),
    projectId: String(r.projectId),
    reviewerId: String(r.reviewer.userId),
    revieweeId: String(r.reviewee.userId),
    isAnonymous: false,
    skillRatings,
    comment: r.comment,
    createdAt: r.createdAt,
  };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const evaluationsApi = {
  list: (projectId: number) =>
    api.get<EvaluationResponse[]>(`/projects/${projectId}/evaluations`),

  received: (projectId: number) =>
    api.get<EvaluationResponse[]>(`/projects/${projectId}/evaluations/received`),

  create: (projectId: number, data: EvaluationRequest) =>
    api.post<EvaluationResponse>(`/projects/${projectId}/evaluations`, data),

  update: (projectId: number, evaluationId: number, data: Omit<EvaluationRequest, 'revieweeId'>) =>
    api.put<EvaluationResponse>(`/projects/${projectId}/evaluations/${evaluationId}`, data),

  delete: (projectId: number, evaluationId: number) =>
    api.del<void>(`/projects/${projectId}/evaluations/${evaluationId}`),
};
