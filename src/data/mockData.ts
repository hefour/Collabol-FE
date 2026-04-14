import type {
  User,
  MyProfile,
  Project,
  Task,
  Review,
} from '../types';

// ─── 현재 로그인 사용자 ────────────────────────────────────────────────────────

export const currentUser: MyProfile = {
  id: 'u1',
  name: '김민준',
  email: 'minjun@soongsil.ac.kr',
  studentId: '20201234',
  department: '컴퓨터학부',
  grade: 3,
  bio: '프론트엔드 개발에 관심 있는 3학년입니다. React와 TypeScript를 주로 사용해요.',
  avatarUrl: undefined,
  skills: ['React', 'TypeScript', 'Figma', 'Git'],
  createdAt: '2024-03-01T00:00:00Z',
  skillRatings: [
    { tag: '발표력',      score: 4.2 },
    { tag: '성실성',      score: 4.7 },
    { tag: '커뮤니케이션', score: 4.5 },
    { tag: '기획력',      score: 3.8 },
    { tag: '협업태도',    score: 4.9 },
  ],
  reviewCount: 8,
  projectCount: 4,
};

// ─── 다른 사용자들 ────────────────────────────────────────────────────────────

export const users: User[] = [
  {
    id: 'u2',
    name: '이서연',
    email: 'seoyeon@soongsil.ac.kr',
    studentId: '20211056',
    department: '경영학부',
    grade: 2,
    bio: '기획과 마케팅을 좋아하는 2학년입니다.',
    skills: ['기획', 'Notion', 'Figma'],
    createdAt: '2024-03-05T00:00:00Z',
  },
  {
    id: 'u3',
    name: '박지호',
    email: 'jiho@soongsil.ac.kr',
    studentId: '20201567',
    department: '소프트웨어학부',
    grade: 3,
    bio: '백엔드 개발자 지망생. Spring Boot, Java 주력.',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
    createdAt: '2024-02-20T00:00:00Z',
  },
  {
    id: 'u4',
    name: '최유진',
    email: 'yujin@soongsil.ac.kr',
    studentId: '20221234',
    department: '산업정보시스템학과',
    grade: 2,
    bio: 'UI/UX 디자인을 공부하고 있는 2학년입니다.',
    skills: ['Figma', 'Adobe XD', 'Illustrator'],
    createdAt: '2024-03-10T00:00:00Z',
  },
];

// ─── 프로젝트 ─────────────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    id: 'p1',
    title: 'Collabol 플랫폼 개발',
    description: '대학생 협업 프로필 플랫폼. 팀플 전 팀원 능력치 확인 서비스.',
    status: 'in_progress',
    ownerId: 'u1',
    members: [
      { userId: 'u1', name: '김민준', role: '프론트엔드' },
      { userId: 'u3', name: '박지호', role: '백엔드' },
      { userId: 'u4', name: '최유진', role: 'UI/UX 디자인' },
    ],
    tags: ['React', 'Spring Boot', '팀플'],
    startDate: '2026-03-01',
    dueDate: '2026-06-01',
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'p2',
    title: '캠퍼스 중고거래 앱',
    description: '숭실대 학생들을 위한 교내 중고 물품 거래 모바일 앱.',
    status: 'recruiting',
    ownerId: 'u2',
    members: [
      { userId: 'u2', name: '이서연', role: 'PM' },
    ],
    tags: ['Flutter', '기획', 'UX'],
    startDate: '2026-04-15',
    dueDate: '2026-05-15',
    createdAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'p3',
    title: '스터디 매칭 서비스',
    description: '관심사 기반 스터디 그룹 매칭 웹 서비스.',
    status: 'completed',
    ownerId: 'u1',
    members: [
      { userId: 'u1', name: '김민준', role: '풀스택' },
      { userId: 'u2', name: '이서연', role: '기획/디자인' },
    ],
    tags: ['Next.js', 'Node.js', '스터디'],
    startDate: '2025-09-01',
    endDate: '2026-02-28',
    createdAt: '2025-09-01T00:00:00Z',
  },
];

// ─── 태스크 ──────────────────────────────────────────────────────────────────

export const tasks: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'types/index.ts 작성',
    status: 'done',
    priority: 'high',
    assigneeId: 'u1',
    dueDate: '2026-04-11',
    createdAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 't2',
    projectId: 'p1',
    title: '레이아웃 컴포넌트 구현',
    description: 'Sidebar, MobileNav, Layout 구현',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'u1',
    dueDate: '2026-04-12',
    createdAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 't3',
    projectId: 'p1',
    title: 'HomePage 구현',
    status: 'todo',
    priority: 'high',
    assigneeId: 'u1',
    dueDate: '2026-04-14',
    createdAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 't4',
    projectId: 'p1',
    title: 'API 연결 (Spring Boot)',
    description: '백엔드 완료 후 API 연결',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'u3',
    dueDate: '2026-05-01',
    createdAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 't5',
    projectId: 'p1',
    title: 'DB 설계 완료',
    status: 'done',
    priority: 'high',
    assigneeId: 'u3',
    dueDate: '2026-04-05',
    createdAt: '2026-03-25T00:00:00Z',
  },
];

// ─── 동료 평가 ────────────────────────────────────────────────────────────────

export const reviews: Review[] = [
  {
    id: 'r1',
    projectId: 'p3',
    reviewerId: 'u2',
    revieweeId: 'u1',
    isAnonymous: false,
    skillRatings: [
      { tag: '발표력',      score: 4 },
      { tag: '성실성',      score: 5 },
      { tag: '커뮤니케이션', score: 5 },
      { tag: '기획력',      score: 4 },
      { tag: '협업태도',    score: 5 },
    ],
    comment: '항상 먼저 소통하려 하고 피드백을 잘 반영해줘서 함께 작업하기 편했어요!',
    createdAt: '2026-03-05T00:00:00Z',
  },
  {
    id: 'r2',
    projectId: 'p1',
    reviewerId: 'u3',
    revieweeId: 'u1',
    isAnonymous: true,
    skillRatings: [
      { tag: '발표력',      score: 4 },
      { tag: '성실성',      score: 5 },
      { tag: '커뮤니케이션', score: 4 },
      { tag: '기획력',      score: 3 },
      { tag: '협업태도',    score: 5 },
    ],
    comment: '데드라인을 항상 잘 지키는 팀원입니다.',
    createdAt: '2026-04-08T00:00:00Z',
  },
];
