import { useState } from 'react';
import { currentUser, projects, tasks, reviews, activities, allUsers } from '../data/mockData';
import { ProjectCard } from '../components/ui/ProjectCard';

type Filter = 'all' | 'in_progress' | 'completed';

const TAB_LABELS: Record<Filter, string> = {
  all: '전체',
  in_progress: '진행 중',
  completed: '완료',
};

export default function ProjectsPage() {
  const [filter, setFilter] = useState<Filter>('all');

  // 내 프로젝트 (currentUser가 멤버인 것만)
  const myProjects = projects.filter(p =>
    p.members.some(m => m.userId === currentUser.id),
  );
  const inProgressProjects = myProjects.filter(p => p.status === 'in_progress');
  const completedProjects  = myProjects.filter(p => p.status === 'completed');

  // 통계: 평균 진행률 (진행 중 프로젝트)
  const avgProgress =
    inProgressProjects.length > 0
      ? inProgressProjects.reduce((acc, p) => {
          const pt = tasks.filter(t => t.projectId === p.id);
          const done = pt.filter(t => t.status === 'done').length;
          return acc + (pt.length > 0 ? done / pt.length : 0);
        }, 0) / inProgressProjects.length
      : 0;

  // 통계: 평균 평점
  const myReviews = reviews.filter(r => r.revieweeId === currentUser.id);
  const avgRating =
    myReviews.length > 0
      ? myReviews.reduce((sum, r) => {
          const mean = r.skillRatings.reduce((s, sr) => s + sr.score, 0) / r.skillRatings.length;
          return sum + mean;
        }, 0) / myReviews.length
      : 0;

  // 통계: 이번 주 활동 (최근 7일 activities)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyActivity = activities.filter(
    a =>
      myProjects.some(p => p.id === a.projectId) &&
      new Date(a.createdAt) >= weekAgo,
  ).length;

  const filtered =
    filter === 'all'
      ? myProjects
      : filter === 'in_progress'
      ? inProgressProjects
      : completedProjects;

  const tabCounts: Record<Filter, number> = {
    all: myProjects.length,
    in_progress: inProgressProjects.length,
    completed: completedProjects.length,
  };

  return (
    <div style={{ padding: '20px 16px', maxWidth: 1100 }} className="md-page-padding">

      {/* ── 헤더 ── */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>프로젝트</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            참여 중인 프로젝트와 종료된 프로젝트를 한곳에서 관리해요
          </p>
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--green)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          + 새 프로젝트
        </button>
      </div>

      {/* ── 통계 바 ── */}
      <div className="stats-grid">
        <StatCard
          label="전체 프로젝트"
          value={String(myProjects.length)}
          sub={`진행 중 ${inProgressProjects.length} · 완료 ${completedProjects.length}`}
        />
        <StatCard
          label="평균 진행률"
          value={`${Math.round(avgProgress * 100)}%`}
          sub="진행 중 프로젝트 기준"
        />
        <StatCard
          label="평균 평점"
          value={avgRating > 0 ? avgRating.toFixed(1) : '—'}
          sub={`/ 5.0 · ${myReviews.length}개 평가`}
        />
        <StatCard
          label="이번 주 활동"
          value={String(weeklyActivity)}
          sub="최근 7일 기준"
        />
      </div>

      {/* ── 탭 필터 ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'in_progress', 'completed'] as Filter[]).map(f => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: active ? '1px solid var(--border2)' : '1px solid transparent',
                  background: active ? 'var(--surface)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                {TAB_LABELS[f]}&nbsp;
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: active ? 'var(--green)' : 'var(--text-tertiary)',
                  }}
                >
                  {tabCounts[f]}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button style={ghostBtn}>필터</button>
          <button style={ghostBtn}>최근 활동 ↓</button>
        </div>
      </div>

      {/* ── 카드 그리드 ── */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 0',
            color: 'var(--text-tertiary)',
            fontSize: 14,
          }}
        >
          프로젝트가 없습니다.
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              tasks={tasks.filter(t => t.projectId === p.id)}
              reviews={reviews.filter(r => r.projectId === p.id)}
              activities={activities.filter(a => a.projectId === p.id)}
              allUsers={allUsers}
              currentUserId={currentUser.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── 통계 카드 ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
      }}
    >
      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6 }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{sub}</p>
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  padding: '7px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '0.5px solid var(--border2)',
  background: 'var(--surface)',
  color: 'var(--text-secondary)',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
};
