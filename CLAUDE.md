# Collabol

대학생 협업 프로필 플랫폼. 팀플 전 팀원 능력치 확인, 팀플 후 동료 평가로 프로필을 쌓아가는 서비스.
주 타겟: 숭실대학교 2~4학년 대학생.

## 기술 스택
- Frontend: React 18 + Vite + Tailwind CSS v4 + React Router v6 + TypeScript
- Backend: Spring Boot 3 + Spring Security + Spring Data JPA (추후 연결)
- DB: MySQL 8 (추후 연결)
- Auth: 이메일 인증 + JWT (추후 연결)

## 폴더 구조
src/
├── components/
│   ├── layout/   # Layout, Sidebar, MobileNav
│   └── ui/       # 재사용 컴포넌트
├── pages/        # HomePage, ProjectsPage, ProfilePage, ReviewPage, SharePage
├── types/        # TypeScript 타입 정의
├── data/         # mockData.ts (백엔드 연결 전)
├── hooks/
└── utils/

## 라우팅
- `/` → HomePage (대시보드)
- `/projects` → ProjectsPage
- `/profile` → ProfilePage
- `/review` → ReviewPage
- `/profile/:userId/share` → SharePage (비회원 접근 가능)

## 디자인 시스템
CSS 변수로 관리 (src/index.css):
- 메인 컬러: --green: #1D9E75
- 배경: --bg: #F5F4F0, --surface: #FFFFFF, --surface2: #F0EFE9
- 폰트: Pretendard

## 현재 상태
- [x] 폴더 구조 및 기본 세팅 완료 (vite.config.ts, index.css, main.tsx, App.tsx)
- [ ] types/index.ts - 타입 정의
- [ ] data/mockData.ts - 목업 데이터
- [ ] components/layout/ - Layout, Sidebar, MobileNav
- [ ] pages/ - 각 페이지 구현
- [ ] HomePage 우선 구현 (기존 teamca-main.html 디자인 참고)

## MVP 핵심 기능
1. 회원 관리 (회원가입/로그인, 프로필 기본 정보)
2. 프로젝트 & 태스크 관리
3. 동료 평가 (스킬 태그 5개 별점, 익명 옵션)
4. 프로필 카드 (공유 링크)

## 스킬 태그 5개
발표력 / 성실성 / 커뮤니케이션 / 기획력 / 협업태도

## 컨벤션
- 커밋: conventional commits (feat:, fix:, refactor: 등)
- 브랜치: main / develop / feature/기능명
- API prefix: /api/v1/... (연결 시)
- Vite proxy: /api → http://localhost:8080
 