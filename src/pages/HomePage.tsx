import { useNavigate } from 'react-router-dom';
import { currentUser, projects, tasks, reviews } from '../data/mockData';
import { Avatar } from '../components/ui/Avatar';
import { SkillBar } from '../components/ui/SkillBar';
import { ProjectCard } from '../components/ui/ProjectCard';

function CircularProgress({ score }: { score: number }) {
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 5);
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r={r} stroke="#9FE1CB" strokeWidth="4" />
      <circle
        cx="26" cy="26" r={r}
        stroke="var(--green)"
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
    </svg>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  const avgScore =
    currentUser.skillRatings.reduce((sum, r) => sum + r.score, 0) /
    currentUser.skillRatings.length;

  const writtenReviewCount = reviews.filter(r => r.reviewerId === currentUser.id).length;

  const myProjects = projects
    .filter(p => p.members.some(m => m.userId === currentUser.id))
    .slice(0, 4);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }}>

      {/* ─── Topbar ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            안녕하세요, {currentUser.name.slice(1)}님 👋
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 3 }}>
            오늘도 좋은 협업 되세요
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: '0.5px solid var(--border2)',
              background: 'var(--surface)', color: 'var(--text-secondary)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="4" /><path d="M10 10l2.5 2.5" />
            </svg>
            팀원 찾기
          </button>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: 'none', background: 'var(--green)', color: '#fff',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 2v10M2 7h10" />
            </svg>
            새 프로젝트
          </button>
          <div
            style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              background: 'var(--surface)', border: '0.5px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5v2.5L2 10h12l-1.5-1.5V6A4.5 4.5 0 0 0 8 1.5Z" />
              <path d="M6.5 12.5a1.5 1.5 0 0 0 3 0" />
            </svg>
            <div style={{ position: 'absolute', top: 8, right: 9, width: 6, height: 6, background: 'var(--coral)', borderRadius: '50%' }} />
          </div>
        </div>
      </div>

      {/* ─── Profile Card ─── */}
      <div
        style={{
          background: 'var(--surface)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: 28,
          marginBottom: 24,
        }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <Avatar name={currentUser.name} size={64} colorIndex={0} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.3px' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              숭실대학교 · {currentUser.department} · {currentUser.grade}학년
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={() => navigate(`/profile/${currentUser.id}/share`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                border: '0.5px solid var(--border2)',
                background: 'var(--surface)', color: 'var(--text-secondary)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="2" cy="6.5" r="1.5" />
                <circle cx="11" cy="2" r="1.5" />
                <circle cx="11" cy="11" r="1.5" />
                <path d="M3.5 5.7L9.5 2.8M3.5 7.3l6 2.9" />
              </svg>
              프로필 공유
            </button>
          </div>
        </div>

        {/* 바디 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* 종합 점수 */}
          <div
            style={{
              background: 'var(--green-light)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--green-mid)', marginBottom: 6 }}>
                종합 점수
              </div>
              <div>
                <span style={{ fontSize: 36, fontWeight: 600, color: 'var(--green-dark)', lineHeight: 1 }}>
                  {avgScore.toFixed(1)}
                </span>
                <span style={{ fontSize: 14, color: 'var(--green)', marginLeft: 2 }}>/ 5.0</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 4 }}>
                받은 평가 {currentUser.reviewCount}개
              </div>
            </div>
            <CircularProgress score={avgScore} />
          </div>

          {/* 통계 */}
          <div
            style={{
              display: 'flex',
              background: 'var(--surface2)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            {[
              { num: currentUser.projectCount, label: '참여 프로젝트' },
              { num: currentUser.reviewCount,  label: '받은 평가' },
              { num: writtenReviewCount,        label: '작성한 평가' },
            ].map((stat, i, arr) => (
              <div
                key={stat.label}
                style={{
                  flex: 1,
                  padding: '16px 0',
                  textAlign: 'center',
                  borderRight: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none',
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>{stat.num}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* 스킬 평가 */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div
              style={{
                fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)',
                letterSpacing: '0.3px', marginBottom: 14, textTransform: 'uppercase',
              }}
            >
              스킬 평가
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {currentUser.skillRatings.map(rating => (
                <SkillBar key={rating.tag} rating={rating} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 진행 중인 프로젝트 ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
          진행 중인 프로젝트
        </span>
        <button
          onClick={() => navigate('/projects')}
          style={{
            fontSize: 13, color: 'var(--text-tertiary)',
            background: 'none', border: 'none', cursor: 'pointer',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--green)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)')}
        >
          전체보기 →
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
        {myProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            tasks={tasks.filter(t => t.projectId === project.id)}
            currentUserId={currentUser.id}
            onEvaluate={() => navigate('/review')}
          />
        ))}
      </div>
    </div>
  );
}
