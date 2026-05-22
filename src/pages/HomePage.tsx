import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { userApi, type UserMeResponse } from '../api/user';
import { projectsApi, toProject } from '../api/projects';
import { evaluationsApi, toReview } from '../api/evaluations';
import { Avatar } from '../components/ui/Avatar';
import { SkillBar } from '../components/ui/SkillBar';
import { ProjectCard } from '../components/ui/ProjectCard';
import type { Project, SkillRating } from '../types';

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

  const [profile, setProfile]           = useState<UserMeResponse | null>(null);
  const [projects, setProjects]         = useState<Project[]>([]);
  const [skillRatings, setSkillRatings] = useState<SkillRating[]>([]);
  const [receivedCount, setReceivedCount] = useState(0);
  const [writtenCount, setWrittenCount]   = useState(0);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [profileData, projectList] = await Promise.all([
          userApi.me(),
          projectsApi.list(),
        ]);
        setProfile(profileData);
        const mapped = projectList.map(toProject);
        setProjects(mapped);

        const completedIds = mapped
          .filter(p => p.status === 'completed')
          .map(p => Number(p.id));

        if (completedIds.length > 0) {
          const evalResults = await Promise.all(
            completedIds.map(id => Promise.all([
              evaluationsApi.received(id),
              evaluationsApi.list(id),
            ]))
          );
          const received = evalResults.flatMap(([r]) => r.map(toReview));
          const written  = evalResults.flatMap(([, w]) => w.map(toReview));

          if (received.length > 0) {
            const sums: Record<string, number[]> = {};
            received.forEach(rev => {
              rev.skillRatings.forEach(sr => {
                if (!sums[sr.tag]) sums[sr.tag] = [];
                sums[sr.tag].push(sr.score);
              });
            });
            setSkillRatings(
              Object.entries(sums).map(([tag, scores]) => ({
                tag: tag as SkillRating['tag'],
                score: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)),
              }))
            );
          }
          setReceivedCount(received.length);
          setWrittenCount(written.length);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const avgScore = skillRatings.length > 0
    ? skillRatings.reduce((s, r) => s + r.score, 0) / skillRatings.length
    : 0;

  const inProgressProjects = projects.filter(p => p.status === 'in_progress').slice(0, 4);

  if (loading) return <div style={{ padding: 24, color: 'var(--text-tertiary)' }}>불러오는 중...</div>;

  return (
    <div style={{ padding: '20px 16px' }} className="md-page-padding">

      {/* ─── Topbar ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            안녕하세요, {profile?.name ?? ''}님 👋
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 3 }}>
            오늘도 좋은 협업 되세요
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
          <Avatar name={profile?.name ?? '?'} size={64} colorIndex={0} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.3px' }}>
              {profile?.name ?? ''}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              숭실대학교 · {profile?.department ?? ''}
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={() => navigate(`/profile/${profile?.id}/share`)}
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
        <div className="profile-body-grid">
          {/* 협업 점수 */}
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
                협업 점수
              </div>
              <div>
                <span style={{ fontSize: 36, fontWeight: 600, color: 'var(--green-dark)', lineHeight: 1 }}>
                  {avgScore.toFixed(1)}
                </span>
                <span style={{ fontSize: 14, color: 'var(--green)', marginLeft: 2 }}>/ 5.0</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 4 }}>
                받은 평가 {receivedCount}개
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
              { num: projects.length, label: '참여 프로젝트' },
              { num: receivedCount,   label: '받은 평가' },
              { num: writtenCount,    label: '작성한 평가' },
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

          {/* 협업 능력 평가 */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div
              style={{
                fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)',
                letterSpacing: '0.3px', marginBottom: 14, textTransform: 'uppercase',
              }}
            >
              협업 능력 평가
            </div>
            {skillRatings.length > 0 ? (
              <div className="skill-grid">
                {skillRatings.map(rating => (
                  <SkillBar key={rating.tag} rating={rating} />
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '8px 0' }}>
                완료된 프로젝트의 동료 평가가 쌓이면 여기에 표시돼요
              </div>
            )}
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

      {inProgressProjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-tertiary)', fontSize: 14 }}>
          진행 중인 프로젝트가 없어요
        </div>
      ) : (
        <div className="card-grid" style={{ marginBottom: 32 }}>
          {inProgressProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={[]}
              reviews={[]}
              activities={[]}
              allUsers={[]}
              currentUserId={String(profile?.id ?? '')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
