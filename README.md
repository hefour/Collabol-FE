# Collaball — Collaboration for All

숭실대학교 학생 전용 팀 프로젝트 동료 평가 및 협업 프로필 플랫폼.

팀플 전에는 팀원의 협업 이력과 평가를 확인하고,  
팀플 후에는 동료 평가를 통해 개인의 협업 프로필을 쌓아가는 서비스입니다.

> 주 타겟: 숭실대학교 2~4학년 대학생

---

## 문제 정의

대학생 팀 프로젝트에서는 팀원의 역량과 협업 태도를 사전에 파악하기 어렵고,  
무임승차나 역할 불균형 문제가 자주 발생합니다.

Collaball은 협업 이력과 동료 평가 기반 프로필을 통해  
신뢰 기반 팀 구성을 돕는 것을 목표로 합니다.

---

## 기술 스택

### Frontend
| 분류 | 기술 |
|------|------|
| Framework | React 19 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| HTTP | fetch (자체 래핑) |
| Auth | JWT (Access Token + Refresh Token) |

### Backend
| 분류 | 기술 |
|------|------|
| Language | Java 17 |
| Framework | Spring Boot 3.5.13 |
| Build | Gradle |
| ORM | Spring Data JPA |
| Auth | Spring Security + JWT (jjwt 0.12.3) |
| Mail | Gmail SMTP |

### Database
- MySQL

---

## 주요 기능

### 회원 관리
- 숭실대 이메일(`@soongsil.ac.kr`) 인증 기반 회원가입
- JWT 액세스/리프레시 토큰 로그인

### 대시보드
- 5개 협업 항목 평균 점수 종합 시각화
- 진행 중인 프로젝트 요약 카드
- 참여 프로젝트 수 / 작성한 평가 / 받은 평가 통계

### 프로젝트 & 태스크 관리
- 프로젝트 생성 및 초대 코드 기반 팀원 참가
- 태스크 생성, 담당자 배정, 상태 관리 (TODO / IN_PROGRESS / DONE)

### 동료 평가
- 5개 항목 별점 평가 (발표력 / 커뮤니케이션 / 협업태도 / 성실성 / 기획력)
- 자유 코멘트
- 중복 평가 방지
- 전원 평가 완료 시 프로젝트 상태 자동 전환

### 프로필 카드
- 받은 평가 점수 집계 및 평균 표시
- 참여 프로젝트 수 표시
- 공유 가능한 프로필 링크 제공

---

## API 명세

> Base URL: `/api`  
> 인증이 필요한 요청은 `Authorization: Bearer {accessToken}` 헤더 포함

### 인증
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/email/send` | 이메일 인증 코드 발송 |
| POST | `/api/auth/email/verify` | 이메일 인증 코드 확인 |
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/refresh` | 토큰 재발급 |
| POST | `/api/auth/logout` | 로그아웃 |

### 프로젝트
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/projects` | 내 프로젝트 목록 |
| POST | `/api/projects` | 프로젝트 생성 |
| GET | `/api/projects/:id` | 프로젝트 상세 |
| PUT | `/api/projects/:id` | 프로젝트 수정 |
| DELETE | `/api/projects/:id` | 프로젝트 삭제 |
| PUT | `/api/projects/:id/complete` | 프로젝트 완료 처리 |
| GET | `/api/projects/:id/invite-code` | 초대 코드 조회 |
| POST | `/api/projects/:id/invite-code/regenerate` | 초대 코드 재발급 |

### 팀원
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/invitations/join/:inviteCode` | 초대 코드로 팀 참가 |
| GET | `/api/projects/:id/members` | 팀원 목록 |
| PATCH | `/api/projects/:id/members/:userId/role` | 역할 변경 (MEMBER / LEADER) |
| DELETE | `/api/projects/:id/members/:userId` | 팀원 제거 |

### 태스크
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/projects/:id/tasks` | 태스크 목록 |
| POST | `/api/projects/:id/tasks` | 태스크 생성 |
| GET | `/api/projects/:id/tasks/:taskId` | 태스크 상세 |
| PUT | `/api/projects/:id/tasks/:taskId` | 태스크 수정 |
| PATCH | `/api/projects/:id/tasks/:taskId/status` | 상태 변경 |
| DELETE | `/api/projects/:id/tasks/:taskId` | 태스크 삭제 |

### 동료 평가
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/projects/:id/evaluations` | 내가 한 평가 목록 |
| GET | `/api/projects/:id/evaluations/received` | 내가 받은 평가 목록 |
| POST | `/api/projects/:id/evaluations` | 평가 제출 |
| PUT | `/api/projects/:id/evaluations/:evalId` | 평가 수정 |
| DELETE | `/api/projects/:id/evaluations/:evalId` | 평가 삭제 |

### 프로필
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/profile/:userId` | 프로필 조회 (인증 불필요) |

---

## 프로젝트 상태 흐름

```
IN_PROGRESS → EVALUATION_PENDING → EVALUATION_COMPLETED
```

- `IN_PROGRESS` → `EVALUATION_PENDING`: 리더가 프로젝트 완료 처리
- `EVALUATION_PENDING` → `EVALUATION_COMPLETED`: 전원 상호 평가 완료 시 자동 전환

---

## 로컬 실행

### Backend
> 백엔드는 별도 레포([Collaball](https://github.com/hefour/Collaball))에서 관리됩니다.
```bash
./gradlew bootRun
# 기본 포트: http://localhost:8080
# 환경변수: DB_PASSWORD, MAIL_USERNAME, MAIL_PASSWORD, JWT_SECRET
```

### Frontend
```bash
npm install
npm run dev
# 기본 포트: http://localhost:5173
# API 프록시: /api → http://localhost:8080
```

---

## 팀원 소개

| 이름 | 역할 |
|------|------|
| 장준하 | 메인 개발 및 발표 — 프로젝트 메인 로직 및 주요 기능 구현, 최종 프레젠테이션 담당 |
| 함성준 | 소프트웨어 개발 — 코드 베이스 구축 및 세부 기능 구현, 코드 최적화 |
| 엔흐솝드 | 디자인 — UI/UX 디자인 및 시각 요소 총괄, 발표 자료 제작 |
| 안태경 | 데이터 및 문서화 — 사용자 요구사항 분석, README 및 프로젝트 가이드라인 작성 |

---

## 기대 효과

- **공정한 평가 문화** — 무임승차 방지, 기여도 투명화로 건강한 대학 협업 문화 정착
- **확장 가능성** — 숭실대 이후 타 대학, 기업·부트캠프·해커톤 등으로 플랫폼 확장 가능
