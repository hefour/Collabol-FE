import { useState, useEffect, useMemo, useCallback } from 'react';
import { userApi, type UserMeResponse } from '../api/user';
import { projectsApi, toProject } from '../api/projects';
import { evaluationsApi, type EvaluationResponse } from '../api/evaluations';
import { teamApi, type TeamMemberResponse } from '../api/team';
import { tasksApi, toTask } from '../api/tasks';
import type { Project, SkillRating } from '../types';

// ─── CircularScore ────────────────────────────────────────────────────────────

function CircularScore({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 5);
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
      <circle cx="34" cy="34" r={r} stroke="#C8EFE2" strokeWidth="5" />
      <circle cx="34" cy="34" r={r} stroke="var(--green)" strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset}
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
                  <linearGradient id={`h${i}`}>
                    <stop offset="50%" stopColor="var(--amber)" />
                    <stop offset="50%" stopColor="#E0DED8" />
                  </linearGradient>
                </defs>
                <path d="M6 1l1.3 2.6L10 4l-2 1.9.5 2.7L6 7.4 3.5 8.6 4 5.9 2 4l2.7-.4L6 1z"
                  fill={`url(#h${i})`} />
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

function SkillBar({ rating, rank }: { rating: SkillRating; rank: number }) {
  const pct = (rating.score / 5) * 100;
  const colors = ['#1D9E75', '#2FB88A', '#4ECBA1', '#73D9B7', '#99E5CB'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {rank === 0 && (
            <span style={{ fontSize: 10, fontWeight: 600, color: '#fff', background: 'var(--green)', borderRadius: 4, padding: '1px 5px' }}>
              TOP
            </span>
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
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: colors[rank] ?? 'var(--green)' }} />
      </div>
    </div>
  );
}

// ─── ProjectRow ───────────────────────────────────────────────────────────────

const STATUS_MAP: Record<Project['status'], { label: string; color: string; bg: string }> = {
  in_progress: { label: '진행 중', color: 'var(--green-mid)',  bg: 'var(--green-light)' },
  recruiting:  { label: '모집 중', color: 'var(--blue-dark)',  bg: 'var(--blue-light)'  },
  completed:   { label: '완료',    color: '#888',              bg: 'var(--surface2)'    },
};

function ProjectRow({ project, role }: { project: Project; role: string }) {
  const s = STATUS_MAP[project.status];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '13px 16px',
      background: 'var(--surface2)',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius-md)',
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: project.status === 'in_progress' ? 'var(--green)'
                  : project.status === 'recruiting'  ? 'var(--blue-dark)' : '#CCC',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {project.title}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {project.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{ fontSize: 11, color: 'var(--text-tertiary)', background: 'var(--surface)', borderRadius: 4, padding: '1px 7px' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: s.color, background: s.bg, borderRadius: 10, padding: '3px 9px' }}>
          {s.label}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{role}</span>
      </div>
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
    <div style={{
      background: 'var(--surface2)',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--green-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600,
              color: 'var(--green-mid)',
              border: '0.5px solid var(--border)',
            }}>
              {ev.reviewer.name[0]}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{ev.reviewer.name}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            {projectTitle} · {date}
          </div>
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
            <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${(r.score / 5) * 100}%`, height: '100%', background: 'var(--green)', borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, width: 20, textAlign: 'right' }}>{r.score}</span>
          </div>
        ))}
      </div>

      {ev.comment && (
        <div style={{
          fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
          background: 'var(--surface)', borderRadius: 'var(--radius-sm)', padding: '10px 12px',
        }}>
          "{ev.comment}"
        </div>
      )}
    </div>
  );
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile]             = useState<UserMeResponse | null>(null);
  const [projects, setProjects]           = useState<Project[]>([]);
  const [projectRoles, setProjectRoles]   = useState<Record<string, string>>({});
  const [receivedEvals, setReceivedEvals] = useState<EvaluationResponse[]>([]);
  const [skillRatings, setSkillRatings]   = useState<SkillRating[]>([]);
  const [taskRate, setTaskRate]           = useState(0);
  const [loading, setLoading]             = useState(true);

  const [bio, setBio]               = useState('');
  const [tempBio, setTempBio]       = useState('');
  const [editingBio, setEditingBio] = useState(false);
  const [bioSaving, setBioSaving]   = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [copied, setCopied]         = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [profileData, projectList] = await Promise.all([
          userApi.me(),
          projectsApi.list(),
        ]);
        setProfile(profileData);
        setBio(profileData.bio ?? '');
        const mapped = projectList.map(toProject);
        setProjects(mapped);

        const ids          = mapped.map(p => Number(p.id));
        const completedIds = mapped.filter(p => p.status === 'completed').map(p => Number(p.id));

        const [memberResults, taskResults] = await Promise.all([
          Promise.all(ids.map(id =>
            teamApi.members(id)
              .then(m => ({ id: String(id), m }))
              .catch(() => ({ id: String(id), m: [] as TeamMemberResponse[] }))
          )),
          Promise.all(ids.map(id =>
            tasksApi.list(id)
              .then(t => ({ id: String(id), t }))
              .catch(() => ({ id: String(id), t: [] }))
          )),
        ]);

        const roles: Record<string, string> = {};
        memberResults.forEach(({ id, m }) => {
          const me = (m as TeamMemberResponse[]).find(member => member.userId === profileData.id);
          roles[id] = me ? (me.role === 'LEADER' ? '리더' : '멤버') : '멤버';
        });
        setProjectRoles(roles);

        const myTasks = taskResults
          .flatMap(({ t }) => t.map(toTask))
          .filter(task => task.assigneeId === String(profileData.id));
        if (myTasks.length > 0) {
          setTaskRate(Math.round(myTasks.filter(t => t.status === 'done').length / myTasks.length * 100));
        }

        if (completedIds.length > 0) {
          const evalResults = await Promise.all(
            completedIds.map(id =>
              evaluationsApi.received(id).catch(() => [] as EvaluationResponse[])
            )
          );
          const allEvals = evalResults.flat();
          setReceivedEvals(allEvals);

          if (allEvals.length > 0) {
            const sums: Record<string, number[]> = {};
            allEvals.forEach(ev => {
              const scoreMap: Record<string, number> = {
                '발표력':      ev.presentationScore,
                '커뮤니케이션': ev.communicationScore,
                '협업태도':    ev.collaborationScore,
                '성실성':      ev.sincerityScore,
                '기획력':      ev.planningScore,
              };
              Object.entries(scoreMap).forEach(([tag, score]) => {
                if (!sums[tag]) sums[tag] = [];
                sums[tag].push(score);
              });
            });
            setSkillRatings(
              Object.entries(sums).map(([tag, scores]) => ({
                tag: tag as SkillRating['tag'],
                score: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)),
              }))
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const avgScore    = skillRatings.length > 0
    ? skillRatings.reduce((s, r) => s + r.score, 0) / skillRatings.length
    : 0;
  const sortedSkills   = [...skillRatings].sort((a, b) => b.score - a.score);
  const displayedEvals = showAllReviews ? receivedEvals : receivedEvals.slice(0, 3);

  const projectTitleById = useMemo(() => {
    const m: Record<string, string> = {};
    projects.forEach(p => { m[p.id] = p.title; });
    return m;
  }, [projects]);

  const handleSaveBio = useCallback(async () => {
    setBioSaving(true);
    try {
      const res = await userApi.updateMe(tempBio);
      setBio(res.bio ?? tempBio);
      setEditingBio(false);
    } catch {
      // 실패해도 UI는 닫지 않음
    } finally {
      setBioSaving(false);
    }
  }, [tempBio]);

  const handleCopyLink = () => {
    if (!profile) return;
    const url = `${window.location.origin}/profile/${profile.id}/share`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const stats = [
    { label: '협업 점수',  value: avgScore.toFixed(1),         highlight: true  },
    { label: '받은 평가',  value: `${receivedEvals.length}건`               },
    { label: '프로젝트',   value: `${projects.length}개`                    },
    { label: '태스크 완료', value: `${taskRate}%`                           },
  ];

  if (loading) return <div style={{ padding: 24, color: 'var(--text-tertiary)' }}>불러오는 중...</div>;

  return (
    <div style={{ padding: '20px 16px' }} className="md-page-padding">

      {/* ── 페이지 헤더 ── */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>프로필</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            나의 협업 프로필과 동료 평가 결과를 확인해요
          </p>
        </div>
        <button
          onClick={handleCopyLink}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 16px',
            background: copied ? 'var(--green-light)' : 'var(--surface)',
            border: `1px solid ${copied ? 'transparent' : 'var(--border2)'}`,
            borderRadius: 'var(--radius-md)',
            color: copied ? 'var(--green-mid)' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s', flexShrink: 0,
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
                <circle cx="2.5" cy="6.5" r="1.5" /><circle cx="10.5" cy="2" r="1.5" /><circle cx="10.5" cy="11" r="1.5" />
                <path d="M4 5.7L9 2.8M4 7.3l5 2.9" />
              </svg>
              프로필 공유
            </>
          )}
        </button>
      </div>

      {/* ── 히어로 카드 ── */}
      <div style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        marginBottom: 20,
        overflow: 'hidden',
      }}>
        <div style={{
          height: 80,
          background: 'linear-gradient(135deg, var(--green) 0%, var(--green-mid) 100%)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.05) 0%, transparent 50%)',
          }} />
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ marginTop: -32, marginBottom: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'var(--green-dark)',
              border: '3px solid var(--surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#fff',
              position: 'relative', zIndex: 1,
            }}>
              {profile?.name[0] ?? '?'}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 4 }}>
              {profile?.name ?? ''}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              숭실대학교 · {profile?.department ?? ''}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            {editingBio ? (
              <div>
                <textarea
                  value={tempBio}
                  onChange={e => setTempBio(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%', padding: '10px 12px', height: 72,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border2)',
                    background: 'var(--surface2)',
                    fontSize: 13, lineHeight: 1.6, resize: 'none',
                    fontFamily: 'inherit', color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={handleSaveBio}
                    disabled={bioSaving}
                    style={{
                      padding: '6px 16px',
                      background: bioSaving ? 'var(--text-tertiary)' : 'var(--green)',
                      color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
                      fontSize: 13, fontWeight: 600,
                      cursor: bioSaving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {bioSaving ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={() => { setTempBio(bio); setEditingBio(false); }}
                    style={{
                      padding: '6px 14px', background: 'var(--surface2)', color: 'var(--text-secondary)',
                      border: 'none', borderRadius: 'var(--radius-sm)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <p style={{ fontSize: 13, color: bio ? 'var(--text-secondary)' : 'var(--text-tertiary)', lineHeight: 1.6, flex: 1 }}>
                  {bio || '자기소개를 추가해보세요'}
                </p>
                <button
                  onClick={() => { setTempBio(bio); setEditingBio(true); }}
                  style={{
                    padding: '4px 10px', background: 'transparent',
                    border: '0.5px solid var(--border2)',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    color: 'var(--text-tertiary)', fontSize: 12, fontWeight: 500,
                    whiteSpace: 'nowrap', flexShrink: 0,
                  }}
                >
                  수정
                </button>
              </div>
            )}
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            background: 'var(--surface2)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '0.5px solid var(--border)',
          }}>
            {stats.map((item, i) => (
              <div key={item.label} style={{
                padding: '14px 0', textAlign: 'center',
                borderRight: i < stats.length - 1 ? '0.5px solid var(--border)' : 'none',
              }}>
                <div style={{
                  fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px',
                  color: item.highlight ? 'var(--green)' : 'var(--text-primary)',
                }}>
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

      {/* ── 2열 바디 ── */}
      <div className="profile-body-grid" style={{ marginBottom: 20 }}>

        {/* 협업 능력 평가 */}
        <div style={{
          background: 'var(--surface)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 2 }}>
                협업 능력 평가
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {receivedEvals.length}명의 동료가 평가한 결과예요
              </div>
            </div>
            <CircularScore score={avgScore} />
          </div>

          {sortedSkills.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {sortedSkills.map((rating, i) => (
                  <SkillBar key={rating.tag} rating={rating} rank={i} />
                ))}
              </div>
              <div style={{
                marginTop: 20, padding: '12px 16px',
                background: 'var(--green-light)', borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1l1.8 3.6L14 5.5l-3 2.9.7 4.1L8 10.4l-3.7 2.1.7-4.1L2 5.5l4.2-.9L8 1z" fill="var(--green)" />
                </svg>
                <span style={{ fontSize: 13, color: 'var(--green-dark)', fontWeight: 500 }}>
                  <strong>{sortedSkills[0]?.tag}</strong>이(가) 가장 높게 평가되었어요 ({sortedSkills[0]?.score.toFixed(1)}점)
                </span>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '8px 0' }}>
              완료된 프로젝트의 동료 평가가 쌓이면 여기에 표시돼요
            </div>
          )}
        </div>

        {/* 참여 프로젝트 */}
        <div style={{
          background: 'var(--surface)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: 24,
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 2 }}>
              참여 프로젝트
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              총 {projects.length}개의 프로젝트에 참여했어요
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {projects.map(p => (
              <ProjectRow key={p.id} project={p} role={projectRoles[p.id] ?? '멤버'} />
            ))}
          </div>
          {projects.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-tertiary)', fontSize: 13 }}>
              참여한 프로젝트가 없어요
            </div>
          )}
        </div>
      </div>

      {/* ── 받은 평가 ── */}
      <div style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: 24,
      }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 2 }}>
            받은 평가
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            동료들이 남긴 평가예요
          </div>
        </div>

        {receivedEvals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-tertiary)', fontSize: 13 }}>
            받은 평가가 없어요
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {displayedEvals.map(ev => (
                <ReviewCard
                  key={ev.id}
                  ev={ev}
                  projectTitle={projectTitleById[String(ev.projectId)] ?? '프로젝트'}
                />
              ))}
            </div>
            {receivedEvals.length > 3 && !showAllReviews && (
              <button
                onClick={() => setShowAllReviews(true)}
                style={{
                  width: '100%', marginTop: 12, padding: '12px 0',
                  background: 'transparent', border: 'none',
                  color: 'var(--text-secondary)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                + 이전 평가 {receivedEvals.length - 3}건 더 보기
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
