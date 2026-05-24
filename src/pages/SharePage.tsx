import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { profileApi, type ProfileApiResponse } from '../api/profile';
import { userApi } from '../api/user';
import { projectsApi, toProject } from '../api/projects';
import { evaluationsApi, type EvaluationResponse } from '../api/evaluations';
import type { Project, SkillRating } from '../types';

// ─── CircularScore ────────────────────────────────────────────────────────────

function CircularScore({ score }: { score: number }) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 5);
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
      <circle cx="34" cy="34" r={r} stroke="#C8EFE2" strokeWidth="5" />
      <circle cx="34" cy="34" r={r} stroke="var(--green)" strokeWidth="5"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 34 34)" />
      <text x="34" y="34" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 15, fontWeight: 700, fill: 'var(--green-dark)', fontFamily: 'Pretendard, sans-serif' }}>
        {score.toFixed(1)}
      </text>
    </svg>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────

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
                <path d="M6 1l1.3 2.6L10 4l-2 1.9.5 2.7L6 7.4 3.5 8.6 4 5.9 2 4l2.7-.4L6 1z" fill={`url(#half-${i})`} />
              </>
            ) : (
              <path d="M6 1l1.3 2.6L10 4l-2 1.9.5 2.7L6 7.4 3.5 8.6 4 5.9 2 4l2.7-.4L6 1z"
                fill={filled ? 'var(--amber)' : '#E0DED8'} />
            )}
          </svg>
        );
      })}
    </div>
  );
}

// ─── SkillBar ─────────────────────────────────────────────────────────────────

function ShareSkillBar({ rating, rank }: { rating: SkillRating; rank?: number }) {
  const pct = (rating.score / 5) * 100;
  const rankColors = ['#1D9E75', '#2FB88A', '#4ECBA1', '#73D9B7', '#99E5CB'];
  const barColor = rank !== undefined ? rankColors[rank] : 'var(--green)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {rank === 0 && (
            <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', background: 'var(--green)', borderRadius: 4, padding: '1px 5px' }}>TOP</span>
          )}
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{rating.tag}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Stars score={rating.score} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', width: 28, textAlign: 'right' }}>
            {rating.score.toFixed(1)}
          </span>
        </div>
      </div>
      <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: barColor, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

// ─── ProjectRow ───────────────────────────────────────────────────────────────

const STATUS_MAP: Record<Project['status'], { label: string; color: string; bg: string }> = {
  in_progress:          { label: '진행 중',  color: 'var(--green-mid)', bg: 'var(--green-light)' },
  recruiting:           { label: '모집 중',  color: 'var(--blue-dark)', bg: 'var(--blue-light)'  },
  completed:            { label: '평가 대기', color: '#555',             bg: 'var(--surface2)'    },
  evaluation_completed: { label: '평가 완료', color: '#6366F1',          bg: '#EEF2FF'            },
};

function ProjectRow({ project }: { project: Project }) {
  const s = STATUS_MAP[project.status];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: project.status === 'in_progress' ? 'var(--green)' : project.status === 'recruiting' ? 'var(--blue-dark)' : '#BBB' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {project.title}
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 500, color: s.color, background: s.bg, borderRadius: 10, padding: '3px 9px', flexShrink: 0 }}>
        {s.label}
      </span>
    </div>
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────

function ReviewCard({ ev, projectTitle }: { ev: EvaluationResponse; projectTitle: string }) {
  const skillLabels: SkillRating['tag'][] = ['발표력', '커뮤니케이션', '협업태도', '성실성', '기획력'];
  const scores = [ev.presentationScore, ev.communicationScore, ev.collaborationScore, ev.sincerityScore, ev.planningScore];
  const skillRatings: SkillRating[] = skillLabels.map((tag, i) => ({ tag, score: scores[i] }));
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const date = new Date(ev.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--green-mid)', border: '0.5px solid var(--border)' }}>
              {ev.reviewer.name[0]}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{ev.reviewer.name}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{projectTitle} · {date}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Stars score={avg} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber-dark)' }}>{avg.toFixed(1)}</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginBottom: ev.comment ? 12 : 0 }}>
        {skillRatings.map(r => (
          <div key={r.tag} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', width: 60, flexShrink: 0 }}>{r.tag}</span>
            <div style={{ flex: 1, height: 3, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${(r.score / 5) * 100}%`, height: '100%', background: 'var(--green)', borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)', width: 20, textAlign: 'right' }}>{r.score}</span>
          </div>
        ))}
      </div>
      {ev.comment && (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          "{ev.comment}"
        </div>
      )}
    </div>
  );
}

// ─── SharePage ────────────────────────────────────────────────────────────────

export default function SharePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const [profileData, setProfileData]     = useState<ProfileApiResponse | null>(null);
  const [projects, setProjects]           = useState<Project[]>([]);
  const [receivedEvals, setReceivedEvals] = useState<EvaluationResponse[]>([]);
  const [loading, setLoading]             = useState(true);
  const [notFound, setNotFound]           = useState(false);
  const [isSelf, setIsSelf]               = useState(false);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    async function load() {
      try {
        const profile = await profileApi.get(userId!).catch(() => null);
        if (!profile) { setNotFound(true); setLoading(false); return; }
        setProfileData(profile);

        const token = localStorage.getItem('accessToken');
        const me = token ? await userApi.me().catch(() => null) : null;
        if (!me || String(me.id) !== userId) { setLoading(false); return; }

        setIsSelf(true);
        const projectList = await projectsApi.list();
        const mapped = projectList.map(toProject);
        setProjects(mapped);

        const completedIds = mapped.filter(p => p.status === 'completed' || p.status === 'evaluation_completed').map(p => Number(p.id));
        if (completedIds.length > 0) {
          const evalResults = await Promise.all(
            completedIds.map(id => evaluationsApi.received(id).catch(() => [] as EvaluationResponse[]))
          );
          setReceivedEvals(evalResults.flat());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const skillRatings: SkillRating[] = profileData ? [
    { tag: '발표력',       score: profileData.presentationAvg },
    { tag: '커뮤니케이션', score: profileData.communicationAvg },
    { tag: '협업태도',     score: profileData.collaborationAvg },
    { tag: '성실성',       score: profileData.sincerityAvg },
    { tag: '기획력',       score: profileData.planningAvg },
  ] : [];

  const sortedSkills = [...skillRatings].sort((a, b) => b.score - a.score);

  const projectTitleById = useMemo(() => {
    const m: Record<string, string> = {};
    projects.forEach(p => { m[p.id] = p.title; });
    return m;
  }, [projects]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ─── 상단 바 ─── */}
      <header style={{
        background: 'var(--surface)', borderBottom: '0.5px solid var(--border)',
        padding: '0 24px', height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isSelf && (
            <button
              onClick={() => navigate('/home')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: '0.5px solid var(--border2)', background: 'var(--surface)', color: 'var(--text-secondary)',
                marginRight: 2,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2L3 6.5L8 11" />
              </svg>
              홈으로
            </button>
          )}
          <div style={{ width: 28, height: 28, background: 'var(--green)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2">
              <circle cx="5" cy="5" r="2" /><circle cx="10" cy="9" r="2" />
              <path d="M7 5h1.5M5 7v1.5" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Collaball</span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 4 }}>/ 공유된 프로필</span>
        </div>

        <button
          onClick={handleCopyLink}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 'var(--radius-sm)',
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
            border: '0.5px solid var(--border2)',
            background: copied ? 'var(--green-light)' : 'var(--surface)',
            color: copied ? 'var(--green-mid)' : 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}
        >
          {copied ? (
            <><svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 7l3 3 6-6" /></svg>복사됨!</>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="2.5" cy="6.5" r="1.5" /><circle cx="10.5" cy="2" r="1.5" /><circle cx="10.5" cy="11" r="1.5" /><path d="M4 5.7L9 2.8M4 7.3l5 2.9" /></svg>링크 복사</>
          )}
        </button>
      </header>

      {/* ─── 본문 ─── */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 60px' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-tertiary)', fontSize: 14 }}>
            불러오는 중...
          </div>
        ) : notFound || !profileData ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
            border: '0.5px solid var(--border)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              존재하지 않는 프로필이에요
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
              링크가 올바른지 확인해주세요.
            </div>
          </div>
        ) : (
          <>
            {/* 프로필 히어로 카드 */}
            <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-xl)', marginBottom: 20 }}>
              <div style={{ height: 80, background: 'linear-gradient(135deg, var(--green) 0%, var(--green-mid) 100%)', position: 'relative', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.07) 0%, transparent 60%)' }} />
              </div>

              <div style={{ padding: '0 28px 28px' }}>
                <div style={{ marginTop: -32, marginBottom: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--green-dark)', border: '3px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', position: 'relative', zIndex: 1 }}>
                    {profileData.name[0]}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 5 }}>
                    {profileData.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    숭실대학교 · {profileData.department}
                  </div>
                  {profileData.bio && (
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {profileData.bio}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: 'var(--surface2)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '0.5px solid var(--border)' }}>
                  {[
                    { label: '참여 프로젝트', value: profileData.projectCount },
                    { label: '받은 평가',     value: profileData.reviewCount },
                    { label: '협업 점수',     value: `${profileData.overallAvg.toFixed(1)} / 5.0` },
                  ].map((item, i, arr) => (
                    <div key={item.label} style={{ padding: '14px 0', textAlign: 'center', borderRight: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{item.value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 협업 능력 평가 */}
            <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 2 }}>협업 능력 평가</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{profileData.reviewCount}명의 동료가 평가한 결과예요</div>
                </div>
                <CircularScore score={profileData.overallAvg} />
              </div>
              {profileData.reviewCount > 0 ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {sortedSkills.map((rating, i) => <ShareSkillBar key={rating.tag} rating={rating} rank={i} />)}
                  </div>
                  <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--green-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1l1.8 3.6L14 5.5l-3 2.9.7 4.1L8 10.4l-3.7 2.1.7-4.1L2 5.5l4.2-.9L8 1z" fill="var(--green)" />
                    </svg>
                    <span style={{ fontSize: 13, color: 'var(--green-dark)', fontWeight: 500 }}>
                      <strong>{sortedSkills[0]?.tag}</strong>이(가) 가장 높게 평가되었어요 ({sortedSkills[0]?.score.toFixed(1)}점)
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '8px 0' }}>동료 평가가 아직 없어요</div>
              )}
            </div>

            {/* 참여 프로젝트 — 본인만 상세 표시 */}
            {isSelf && (
              <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 2 }}>참여 프로젝트</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>총 {projects.length}개의 프로젝트에 참여했어요</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {projects.map(p => <ProjectRow key={p.id} project={p} />)}
                </div>
                {projects.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-tertiary)', fontSize: 13 }}>참여한 프로젝트가 없어요</div>
                )}
              </div>
            )}

            {/* 받은 평가 — 본인만 상세 표시 */}
            {isSelf && (
              <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24, marginBottom: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 2 }}>받은 평가</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>동료들이 남긴 평가예요</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {receivedEvals.map(ev => (
                    <ReviewCard key={ev.id} ev={ev} projectTitle={projectTitleById[String(ev.projectId)] ?? '프로젝트'} />
                  ))}
                </div>
                {receivedEvals.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-tertiary)', fontSize: 13 }}>받은 평가가 없어요</div>
                )}
              </div>
            )}
          </>
        )}

        {/* 푸터 */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>
            이 프로필은 <strong style={{ color: 'var(--green)' }}>Collaball</strong>에서 공유되었습니다
          </div>
          <div style={{ fontSize: 11, color: '#C0BFBA' }}>대학생 협업 프로필 플랫폼 · 숭실대학교</div>
        </div>
      </main>
    </div>
  );
}
