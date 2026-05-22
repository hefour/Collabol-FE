import { useNavigate } from 'react-router-dom';
import type { Project, Task, Review, Activity, User } from '../../types';
import { AvatarGroup } from './Avatar';

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  reviews: Review[];
  activities: Activity[];
  allUsers: User[];
  currentUserId: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function formatMonthDay(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function getRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.floor(hr / 24)}일 전`;
}

function StarRow({ score }: { score: number }) {
  const full = Math.round(score);
  return (
    <span style={{ color: '#F59E0B', fontSize: 15, letterSpacing: 1 }}>
      {'★'.repeat(Math.min(full, 5))}{'☆'.repeat(Math.max(0, 5 - full))}
    </span>
  );
}

// ── 날짜 정보 아이콘 (인라인 SVG) ────────────────────────────────────────────

function IconCalendar() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <rect x="1.5" y="2.5" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1.5 6.5h13M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconPeople() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="12" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M14.5 13c0-2-1.3-3.5-2.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M8 1.5l1.8 3.8 4.2.6-3 3 .7 4.1L8 11l-3.7 2-.7-4.1-3-3 4.2-.6z"/>
    </svg>
  );
}

export function ProjectCard({ project, tasks, reviews, activities, allUsers, currentUserId }: ProjectCardProps) {
  const navigate = useNavigate();
  const isCompleted = project.status === 'completed';

  // 진행률
  const done = tasks.filter(t => t.status === 'done').length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // 날짜 범위
  const endDateStr = project.dueDate || project.endDate;
  const dateRange = endDateStr
    ? `${formatDate(project.startDate)} ~ ${
        new Date(project.startDate).getFullYear() === new Date(endDateStr).getFullYear()
          ? formatMonthDay(endDateStr)
          : formatDate(endDateStr)
      }`
    : formatDate(project.startDate);

  // 남은 기간
  const remDays = project.dueDate
    ? Math.ceil((new Date(project.dueDate).getTime() - Date.now()) / 86400000)
    : null;

  // 평균 평점 (완료 카드)
  const avgScore =
    reviews.length > 0
      ? reviews.reduce((sum, r) => {
          const mean = r.skillRatings.reduce((s, sr) => s + sr.score, 0) / r.skillRatings.length;
          return sum + mean;
        }, 0) / reviews.length
      : 0;

  // 최근 활동 (진행 중 카드)
  const latestActivity = [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
  const actorName = latestActivity
    ? allUsers.find(u => u.id === latestActivity.userId)?.name ?? ''
    : '';

  // 최근 리뷰 (완료 카드)
  const latestReview = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
  const reviewerName =
    latestReview && !latestReview.isAnonymous
      ? allUsers.find(u => u.id === latestReview.reviewerId)?.name ?? ''
      : '익명';

  const badgeStyle: React.CSSProperties = isCompleted
    ? { background: 'var(--surface2)', color: 'var(--text-secondary)' }
    : { background: 'var(--green-light)', color: 'var(--green-mid)' };

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        transition: 'border-color 0.15s, transform 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      }}
    >
      {/* ── 제목 + 배지 + 메뉴 ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, flex: 1 }}>
          {project.title}
        </h3>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          <span
            style={{
              ...badgeStyle,
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {isCompleted ? '완료' : '진행 중'}
          </span>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              fontSize: 16,
              lineHeight: 1,
              padding: '2px 4px',
            }}
          >
            ···
          </button>
        </div>
      </div>

      {/* ── 설명 ── */}
      <p
        style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          marginBottom: 14,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {project.description}
      </p>

      {/* ── 날짜 / 팀원 / 기간(or 평가) ── */}
      <div
        style={{
          display: 'flex',
          gap: 14,
          fontSize: 12,
          color: 'var(--text-tertiary)',
          alignItems: 'center',
          marginBottom: 14,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <IconCalendar />
          {dateRange}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <IconPeople />
          팀원 {project.members.length}명
        </span>
        {isCompleted ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconStar />
            동료 평가 {reviews.length}건
          </span>
        ) : remDays !== null ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconClock />
            남은 기간 {remDays > 0 ? `${remDays}일` : remDays === 0 ? 'D-Day' : '마감'}
          </span>
        ) : null}
      </div>

      {/* ── 진행률 (진행 중) / 평점 (완료) ── */}
      {isCompleted ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', flexShrink: 0 }}>평점</span>
          <StarRow score={avgScore} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {avgScore.toFixed(1)}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>/ 5.0</span>
        </div>
      ) : (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>진행률</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
              {done} / {total} 태스크&nbsp;&nbsp;{pct}%
            </span>
          </div>
          <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                background: 'var(--green)',
                borderRadius: 3,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* ── 하단: 아바타 + 활동/리뷰 + 버튼 ── */}
      <div
        style={{
          borderTop: '0.5px solid var(--border)',
          paddingTop: 14,
          marginTop: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <AvatarGroup members={project.members} currentUserId={currentUserId} size={26} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {/* 최근 활동 or 리뷰 한줄 */}
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              paddingRight: 8,
            }}
          >
            {isCompleted
              ? latestReview?.comment
                ? `${reviewerName}: "${latestReview.comment.slice(0, 28)}${latestReview.comment.length > 28 ? '…' : ''}"`
                : ''
              : latestActivity
              ? `${actorName} · ${getRelativeTime(latestActivity.createdAt)} ${latestActivity.action}`
              : ''}
          </span>

          <button
            onClick={() => navigate(`/projects/${project.id}`)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--text-secondary)',
              padding: 0,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {isCompleted ? '상세 보기 →' : '대시보드 열기 →'}
          </button>
        </div>
      </div>
    </div>
  );
}
