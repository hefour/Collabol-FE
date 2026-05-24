// ─── 스킬 태그 ───────────────────────────────────────────────────────────────

export type SkillTag = '발표력' | '성실성' | '커뮤니케이션' | '기획력' | '협업태도';

export const SKILL_TAGS: SkillTag[] = [
  '발표력',
  '성실성',
  '커뮤니케이션',
  '기획력',
  '협업태도',
];

export interface SkillRating {
  tag: SkillTag;
  score: number; // 1~5
}

// ─── 사용자 ──────────────────────────────────────────────────────────────────

export type Department =
  | '컴퓨터학부'
  | '소프트웨어학부'
  | 'AI소프트웨어학부'
  | '경영학부'
  | '산업정보시스템학과'
  | '전자정보공학부'
  | '기계공학부'
  | '화학공학과'
  | '건축학부'
  | '미디어커뮤니케이션학부'
  | '경제학부'
  | '영어영문학과'
  | '기타';

export const DEPARTMENTS: Department[] = [
  '컴퓨터학부',
  '소프트웨어학부',
  '경영학부',
  '산업정보시스템학과',
  '전자정보공학부',
  '기계공학부',
  '화학공학과',
  '건축학부',
  '기타',
];

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;       // 학번
  department: Department;
  grade: 1 | 2 | 3 | 4;
  bio: string;
  avatarUrl?: string;
  skills: string[];        // 기술 스택 (자유 태그)
  createdAt: string;       // ISO 8601
}

// 나의 프로필 집계
export interface MyProfile extends User {
  skillRatings: SkillRating[]; // 동료 평가 평균
  reviewCount: number;
  projectCount: number;
}

// ─── 프로젝트 ─────────────────────────────────────────────────────────────────

export type ProjectStatus = 'recruiting' | 'in_progress' | 'completed' | 'evaluation_completed';

export interface ProjectMember {
  userId: string;
  name: string;
  avatarUrl?: string;
  role: string;            // 역할 (예: 프론트엔드, PM 등)
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  color?: string;
  members: ProjectMember[];
  ownerId: string;
  tags: string[];          // 기술/주제 태그
  startDate: string;       // ISO 8601 date
  dueDate?: string;        // ISO 8601 date (마감 기한)
  endDate?: string;        // ISO 8601 date (완료 시)
  createdAt: string;
}

// ─── 태스크 ──────────────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;     // 담당자 userId
  dueDate?: string;        // ISO 8601 date
  createdAt: string;
}

// ─── 동료 평가 ────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  projectId: string;
  reviewerId: string;      // 평가자 userId (익명이면 UI에서 숨김)
  revieweeId: string;      // 피평가자 userId
  isAnonymous: boolean;
  skillRatings: SkillRating[];
  comment?: string;
  createdAt: string;
}

// ─── 동료 평가 요청 ───────────────────────────────────────────────────────────

export interface ReviewRequest {
  id: string;
  projectId: string;
  revieweeId: string;
  dueDate: string;
  status: 'pending' | 'in_progress';
  progress: number;        // 0–5 (완료한 항목 수)
  lastSavedAt?: string;
  strengthTags?: string[]; // 임시 저장된 강점 태그
}

// ─── 공유 프로필 카드 ─────────────────────────────────────────────────────────

export interface ShareProfile {
  user: User;
  skillRatings: SkillRating[];
  reviewCount: number;
  projectCount: number;
  recentProjects: Pick<Project, 'id' | 'title' | 'status' | 'tags'>[];
}

// ─── 활동 피드 ────────────────────────────────────────────────────────────────

export interface Activity {
  id: string;
  projectId: string;
  userId: string;
  action: string;
  createdAt: string;
}

// ─── API 공통 ─────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
