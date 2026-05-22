import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { currentUser, projects, reviews, users } from '../data/mockData';
import type { SkillRating, Review, Project } from '../types';

// ─── 원형 진행 차트 ───────────────────────────────────────────────────────────

function CircularScore({ score }: { score: number }) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 5);
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
      <circle cx="34" cy="34" r={r} stroke="#C8EFE2" strokeWidth="5" />
      <circle
        cx="34" cy="34" r={r}
        stroke="var(--green)"
        strokeWidth="5"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 34 34)"
      />
      <text
        x="34" y="34"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 15, fontWeight: 700, fill: 'var(--green-dark)', fontFamily: 'Pretendard, sans-serif' }}
      >
        {score.toFixed(1)}
      </text>
    </svg>
  );
}

// ─── 별 아이콘 ────────────────────────────────────────────────────────────────

function Stars({ score }: { score: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = score >= i;
        const half = !filled && score >= i - 0.5;
        return (
          <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="none">
            {half ? (
              <>
                <defs>
                  <linearGradient id={`half-${i}`}>
                    <stop offset="50%" stopColor="var(--amber)" />
                    <stop offset="50%" stopColor="#E0DED8" />
                  </linearGradient>
                </defs>
                <path
                  d="M6 1l1.3 2.6L10 4l-2 1.9.5 2.7L6 7.4 3.5 8.6 4 5.9 2 4l2.7-.4L6 1z"
                  fill={`url(#half-${i})`}
                />
              </>
            ) : (
              <path
                d="M6 1l1.3 2.6L10 4l-2 1.9.5 2.7L6 7.4 3.5 8.6 4 5.9 2 4l2.7-.4L6 1z"
                fill={filled ? 'var(--amber)' : '#E0DED8'}
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}

// ─── 스킬 바 (공유 페이지 전용) ──────────────────────────────────────────────

function ShareSkillBar({ rating, rank }: { rating: SkillRating; rank?: number }) {
  const pct = (rating.score / 5) * 100;
  const rankColors = ['#1D9E75', '#2FB88A', '#4ECBA1', '#73D9B7', '#99E5CB'];
  const barColor = rank !== undefined ? rankColors[rank] : 'var(--green)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {rank === 0 && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#fff',
              background: 'var(--green)', borderRadius: 4,
              padding: '1px 5px',
            }}>TOP</span>
          )}
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
            {rating.tag}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Stars score={rating.score} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', width: 28, textAlign: 'right' }}>
            {rating.score.toFixed(1)}
          </span>
        </div>
      </div>
      <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 4,
            background: barColor,
            transition: 'width 0.6s ease',
          }}
        />
      </div>
    </div>
  );
}

// ─── 프로젝트 칩 ──────────────────────────────────────────────────────────────

const STATUS_MAP: Record<Project['status'], { label: string; color: string; bg: string }> = {
  in_progress: { label: '진행 중',  color: 'var(--green-mid)',  bg: 'var(--green-light)' },
  recruiting:  { label: '모집 중',  color: 'var(--blue-dark)',  bg: 'var(--blue-light)' },
  completed:   { label: '완료',     color: '#555',              bg: 'var(--surface2)' },
};

function ProjectRow({ project }: { project: Project }) {
  const s = STATUS_MAP[project.status];
  const memberRole = project.members.find(m => m.userId === currentUser.id)?.role ?? '참여';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      {/* 상태 도트 */}
      <div
        style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: project.status === 'in_progress' ? 'var(--green)' :
                      project.status === 'recruiting' ? 'var(--blue-dark)' : '#BBB',
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {project.title}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {project.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{ fontSize: 11, color: 'var(--text-tertiary)', background: 'var(--surface2)', borderRadius: 4, padding: '1px 7px' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: s.color, background: s.bg, borderRadius: 10, padding: '3px 9px' }}>
          {s.label}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{memberRole}</span>
      </div>
    </div>
  );
}

// ─── 평가 카드 ────────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  const project = projects.find(p => p.id === review.projectId);
  const reviewer = users.find(u => u.id === review.reviewerId);
  const avgScore = review.skillRatings.reduce((s, r) => s + r.score, 0) / review.skillRatings.length;
  const date = new Date(review.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
  const reviewerName = review.isAnonymous ? '익명' : (reviewer?.name ?? '알 수 없음');
  const reviewerInitial = review.isAnonymous ? '?' : reviewerName[0];

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 18px',
      }}
    >
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <div
              style={{
                width: 28, height: 28, borderRadius: '50%',
                background: review.isAnonymous ? 'var(--surface2)' : 'var(--green-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600,
                color: review.isAnonymous ? 'var(--text-tertiary)' : 'var(--green-mid)',
              }}
            >
              {reviewerInitial}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
              {reviewerName}
            </span>
            {review.isAnonymous && (
              <span style={{ fontSize: 10, color: 'var(--text-tertiary)', background: 'var(--surface2)', borderRadius: 4, padding: '1px 6px' }}>
                익명
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            {project?.title ?? '프로젝트'} · {date}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Stars score={avgScore} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber-dark)' }}>{avgScore.toFixed(1)}</span>
        </div>
      </div>

      {/* 스킬 미니 바 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginBottom: review.comment ? 12 : 0 }}>
        {review.skillRatings.map(r => (
          <div key={r.tag} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', width: 60, flexShrink: 0 }}>{r.tag}</span>
            <div style={{ flex: 1, height: 3, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${(r.score / 5) * 100}%`, height: '100%', background: 'var(--green)', borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)', width: 20, textAlign: 'right' }}>{r.score}</span>
          </div>
        ))}
      </div>

      {/* 코멘트 */}
      {review.comment && (
        <div
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            background: 'var(--surface2)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
          }}
        >
          "{review.comment}"
        </div>
      )}
    </div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function SharePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const isOwner = userId === currentUser.id;

  // 실제 서비스에서는 userId로 API 호출. 현재는 mockData 사용
  const user = currentUser;
  const myProjects = projects.filter(p => p.members.some(m => m.userId === user.id));
  const myReviews = reviews.filter(r => r.revieweeId === user.id);

  const avgScore =
    user.skillRatings.reduce((sum, r) => sum + r.score, 0) / user.skillRatings.length;

  // 스킬 높은 순 정렬
  const sortedSkills = [...user.skillRatings].sort((a, b) => b.score - a.score);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ─── 상단 바 ─── */}
      <header
        style={{
          background: 'var(--surface)',
          borderBottom: '0.5px solid var(--border)',
          padding: '0 24px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isOwner && (
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: '0.5px solid var(--border2)',
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
                marginRight: 2,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2L3 6.5L8 11" />
              </svg>
              홈으로
            </button>
          )}
          <div
            style={{
              width: 28, height: 28,
              background: 'var(--green)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2">
              <circle cx="5" cy="5" r="2" />
              <circle cx="10" cy="9" r="2" />
              <path d="M7 5h1.5M5 7v1.5" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Collaball
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 4 }}>
            / 공유된 프로필
          </span>
        </div>

        <button
          onClick={handleCopyLink}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
            border: '0.5px solid var(--border2)',
            background: copied ? 'var(--green-light)' : 'var(--surface)',
            color: copied ? 'var(--green-mid)' : 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}
        >
          {copied ? (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 7l3 3 6-6" />
              </svg>
              복사됨!
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="2.5" cy="6.5" r="1.5" />
                <circle cx="10.5" cy="2" r="1.5" />
                <circle cx="10.5" cy="11" r="1.5" />
                <path d="M4 5.7L9 2.8M4 7.3l5 2.9" />
              </svg>
              링크 복사
            </>
          )}
        </button>
      </header>

      {/* ─── 본문 ─── */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 60px' }}>

        {/* ── 프로필 히어로 카드 ── */}
        <div
          style={{
            background: 'var(--surface)',
            border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 20,
          }}
        >
          {/* 상단 그린 배너 */}
          <div style={{ height: 80, background: 'linear-gradient(135deg, var(--green) 0%, var(--green-mid) 100%)', position: 'relative', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0' }}>
            <div
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.07) 0%, transparent 60%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05) 0%, transparent 50%)',
              }}
            />
          </div>

          <div style={{ padding: '0 28px 28px' }}>
            {/* 아바타 + 이름 */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -32, marginBottom: 20 }}>
              <div
                style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: 'var(--green-dark)',
                  border: '3px solid var(--surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 700, color: '#fff',
                  flexShrink: 0,
                  position: 'relative', zIndex: 1,
                }}
              >
                {user.name[0]}
              </div>
              <div />
            </div>

            {/* 이름, 학과 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 5 }}>
                {user.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                숭실대학교 · {user.department} · {user.grade}학년
              </div>
              {user.bio && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {user.bio}
                </div>
              )}
            </div>

            {/* 스킬 태그 */}
            {user.skills.length > 0 && (
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 20 }}>
                {user.skills.map(skill => (
                  <span
                    key={skill}
                    style={{
                      fontSize: 12, fontWeight: 500,
                      color: 'var(--text-secondary)',
                      background: 'var(--surface2)',
                      border: '0.5px solid var(--border)',
                      borderRadius: 6,
                      padding: '4px 10px',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* 통계 바 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                background: 'var(--surface2)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '0.5px solid var(--border)',
              }}
            >
              {[
                { label: '참여 프로젝트', value: user.projectCount },
                { label: '받은 평가', value: user.reviewCount },
                { label: '협업 점수', value: `${avgScore.toFixed(1)} / 5.0` },
              ].map((item, i, arr) => (
                <div
                  key={item.label}
                  style={{
                    padding: '14px 0',
                    textAlign: 'center',
                    borderRight: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 협업 능력 평가 ── */}
        <div
          style={{
            background: 'var(--surface)',
            border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: 24,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: 2 }}>
                협업 능력 평가
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {user.reviewCount}명의 동료가 평가한 결과예요
              </div>
            </div>
            <CircularScore score={avgScore} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sortedSkills.map((rating, i) => (
              <ShareSkillBar key={rating.tag} rating={rating} rank={i} />
            ))}
          </div>

          {/* 레이더 요약 배지 */}
          <div
            style={{
              marginTop: 20,
              padding: '12px 16px',
              background: 'var(--green-light)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1l1.8 3.6L14 5.5l-3 2.9.7 4.1L8 10.4l-3.7 2.1.7-4.1L2 5.5l4.2-.9L8 1z" fill="var(--green)" />
            </svg>
            <span style={{ fontSize: 13, color: 'var(--green-dark)', fontWeight: 500 }}>
              <strong>{sortedSkills[0]?.tag}</strong>이(가) 가장 높게 평가되었어요 ({sortedSkills[0]?.score.toFixed(1)}점)
            </span>
          </div>
        </div>

        {/* ── 참여 프로젝트 ── */}
        <div
          style={{
            background: 'var(--surface)',
            border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: 24,
            marginBottom: 20,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: 2 }}>
              참여 프로젝트
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              총 {myProjects.length}개의 프로젝트에 참여했어요
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myProjects.map(project => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </div>

          {myProjects.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-tertiary)', fontSize: 13 }}>
              참여한 프로젝트가 없어요
            </div>
          )}
        </div>

        {/* ── 받은 평가 ── */}
        <div
          style={{
            background: 'var(--surface)',
            border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: 24,
            marginBottom: 20,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: 2 }}>
              받은 평가
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              동료들이 남긴 평가예요
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {myReviews.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-tertiary)', fontSize: 13 }}>
              받은 평가가 없어요
            </div>
          )}
        </div>

        {/* ─── 푸터 ─── */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>
            이 프로필은 <strong style={{ color: 'var(--green)' }}>Collaball</strong>에서 공유되었습니다
          </div>
          <div style={{ fontSize: 11, color: '#C0BFBA' }}>
            대학생 협업 프로필 플랫폼 · 숭실대학교
          </div>
        </div>
      </main>
    </div>
  );
}
