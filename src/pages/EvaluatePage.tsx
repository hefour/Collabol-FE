import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { projectsApi, toProject } from "../api/projects";
import { evaluationsApi } from "../api/evaluations";
import { teamApi, type TeamMemberResponse } from "../api/team";
import { tasksApi, type TaskResponse } from "../api/tasks";
import { userApi } from "../api/user";
import type { Project } from "../types";

const CATEGORIES = [
  { key: 'presentationScore',  label: '발표력',       desc: '자료 정리 및 발표를 통해 의견을 효과적으로 전달하는 능력 수준' },
  { key: 'communicationScore', label: '커뮤니케이션', desc: '의견 공유 / 소통 / 조율 등 양방향 소통 능력 수준' },
  { key: 'collaborationScore', label: '협업태도',     desc: '팀원과 적극적으로 협력하고 함께 성장하려는 자세' },
  { key: 'sincerityScore',     label: '성실성',       desc: '맡은 일에 성실히 임하고 끝까지 완수하는 태도' },
  { key: 'planningScore',      label: '기획력',       desc: '업무 계획 / 분석 / 구조화 등 기획 능력 수준' },
] as const;

type ScoreKey = typeof CATEGORIES[number]['key'];

function RadarChart({ scores }: { scores: Record<ScoreKey, number> }) {
  const cx = 120, cy = 125, r = 88;
  const n = CATEGORIES.length;
  const angle = (i: number) => (Math.PI * 2 * i / n) - Math.PI / 2;
  const pt = (i: number, val: number): [number, number] => {
    const a = angle(i);
    const d = (val / 5) * r;
    return [cx + d * Math.cos(a), cy + d * Math.sin(a)];
  };
  const gridPoly = (lvl: number) =>
    CATEGORIES.map((_, i) => pt(i, lvl)).map(([x, y]) => `${x},${y}`).join(' ');
  const dataPts = CATEGORIES.map((c, i) => pt(i, scores[c.key] || 0));
  const dataPoly = dataPts.map(([x, y]) => `${x},${y}`).join(' ');
  const avg = CATEGORIES.reduce((s, c) => s + (scores[c.key] || 0), 0) / n;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <svg viewBox="0 0 240 260" style={{ width: '100%', maxWidth: 240, overflow: 'visible' }}>
        {[1, 2, 3, 4, 5].map(l => (
          <polygon key={l} points={gridPoly(l)} fill="none"
            stroke={l === 5 ? '#C8DED7' : '#E4EEE9'} strokeWidth={l === 5 ? 1 : 0.7} />
        ))}
        {CATEGORIES.map((_, i) => {
          const [x2, y2] = pt(i, 5);
          return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="#E4EEE9" strokeWidth="0.7" />;
        })}
        <polygon points={dataPoly} fill="rgba(29,158,117,0.18)" stroke="#1D9E75" strokeWidth="2" strokeLinejoin="round" />
        {dataPts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="#1D9E75" />
        ))}
        {CATEGORIES.map((c, i) => {
          const a = angle(i);
          const d = r + 26;
          const x = cx + d * Math.cos(a);
          const y = cy + d * Math.sin(a);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: '11px', fontFamily: 'Pretendard, sans-serif', fill: '#666', fontWeight: '600' }}>
              {c.label}
            </text>
          );
        })}
      </svg>
      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--green)' }}>{avg.toFixed(2)}</span>
        <span style={{ fontSize: 14, color: 'var(--text-tertiary)', marginLeft: 4 }}>/ 5.0</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>평균 평점</div>
    </div>
  );
}

export default function EvaluatePage() {
  const { project: projectId, userId: revieweeId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [revieweeName, setRevieweeName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMemberResponse[]>([]);
  const [evaluatedIds, setEvaluatedIds] = useState<Set<number>>(new Set());
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [revieweeTasks, setRevieweeTasks] = useState<TaskResponse[]>([]);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [scores, setScores] = useState<Record<ScoreKey, number>>({
    presentationScore: 3, communicationScore: 3, collaborationScore: 3,
    sincerityScore: 3, planningScore: 3,
  });
  const [comment, setComment] = useState('');

  const numProjectId = Number(projectId);
  const numRevieweeId = Number(revieweeId);

  useEffect(() => {
    if (isNaN(numProjectId) || isNaN(numRevieweeId)) { setLoading(false); return; }
    Promise.all([
      projectsApi.get(numProjectId),
      teamApi.members(numProjectId),
      evaluationsApi.list(numProjectId),
      userApi.me(),
      tasksApi.list(numProjectId),
    ]).then(([proj, members, evals, me, tasks]) => {
      setProject(toProject(proj));
      setTeamMembers(members);
      const reviewee = members.find(m => m.userId === numRevieweeId);
      setRevieweeName(reviewee?.name ?? '');
      setMyUserId(me.id);
      const done = new Set(
        evals.filter(e => e.reviewer.userId === me.id).map(e => e.reviewee.userId)
      );
      setEvaluatedIds(done);
      setRevieweeTasks(tasks.filter(t => t.assignees.some(a => a.userId === numRevieweeId)));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [numProjectId, numRevieweeId]);

  if (loading) return <div style={{ padding: '20px 16px' }} className="md-page-padding">불러오는 중...</div>;
  if (!project || isNaN(numRevieweeId)) {
    return <div style={{ padding: '20px 16px' }} className="md-page-padding">존재하지 않는 프로젝트입니다.</div>;
  }

  const setScore = (key: ScoreKey, value: number) =>
    setScores(prev => ({ ...prev, [key]: value }));

  const evaluableMembers = teamMembers.filter(m => m.userId !== myUserId);
  const completedCount = evaluableMembers.filter(m => evaluatedIds.has(m.userId)).length;
  const totalCount = evaluableMembers.length;

  async function submit() {
    setSubmitting(true);
    try {
      await evaluationsApi.create(numProjectId, {
        revieweeId: numRevieweeId,
        ...scores,
        comment: comment || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : '평가 제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: '20px 16px' }} className="md-page-padding">

      {/* 브레드크럼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 13, color: 'var(--text-tertiary)' }}>
        <button
          onClick={() => navigate('/review')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 13, padding: 0 }}
        >
          동료 평가
        </button>
        <span>›</span>
        <span style={{ color: 'var(--text-secondary)' }}>{project.title}</span>
        <span>›</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{revieweeName}</span>
      </div>

      {/* 제목 + 진행 상태 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>동료 평가</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            함께한 팀원에 대한 솔직한 피드백을 남겨주세요.
          </p>
        </div>
        {totalCount > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0, marginLeft: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {completedCount} / {totalCount} 평가 완료
            </span>
            <div style={{ width: 120, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                background: 'var(--green)', borderRadius: 3, transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* 2컬럼 레이아웃 */}
      <div className="evaluate-layout">

        {/* ──── 좌측 메인 ──── */}
        <div style={{ minWidth: 0 }}>

          {/* 평가 대상자 카드 */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)',
            borderRadius: 'var(--radius-lg)', marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(255,255,255,0.25)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 800,
              }}>
                {revieweeName ? revieweeName[0] : '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: 3 }}>평가 대상</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{revieweeName || '팀원'}</div>
              </div>
              <button
                onClick={() => setShowTasksModal(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 12px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
                  color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="12" height="11" rx="2" />
                  <path d="M5 1v4M11 1v4M2 7h12" />
                </svg>
                수행 태스크
                {revieweeTasks.length > 0 && (
                  <span style={{
                    background: 'rgba(255,255,255,0.3)', borderRadius: 999,
                    fontSize: 11, fontWeight: 700, padding: '1px 6px',
                  }}>
                    {revieweeTasks.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 협업 역량 평가 */}
          <div style={{
            background: 'var(--surface)', border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: '20px 22px', marginBottom: 16,
          }}>
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 15, fontWeight: 700 }}>협업 역량 평가</p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                이 팀원과 함께하며 느낀 협업 역량을 5점 만점으로 평가해주세요.
              </p>
            </div>
            {CATEGORIES.map(({ key, label, desc }) => {
              const pct = ((scores[key] - 1) / 4) * 100;
              return (
                <div key={key} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{label}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--green)', lineHeight: 1 }}>
                      {scores[key]}<span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>/5</span>
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8, lineHeight: 1.4 }}>{desc}</p>
                  <input
                    type="range"
                    className="score-slider"
                    min={1} max={5} step={1}
                    value={scores[key]}
                    onChange={e => setScore(key, Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, var(--green) 0%, var(--green) ${pct}%, #E0EDE8 ${pct}%, #E0EDE8 100%)`,
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <span key={n} style={{ fontSize: 10, color: n === scores[key] ? 'var(--green)' : 'var(--text-tertiary)', fontWeight: n === scores[key] ? 700 : 400, width: 16, textAlign: 'center' }}>{n}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 함께한 소감 */}
          <div style={{
            background: 'var(--surface)', border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: '20px 22px', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 15, fontWeight: 700 }}>
                함께한 소감
                <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: 6 }}>(선택)</span>
              </p>
              <span style={{ fontSize: 12, color: comment.length > 380 ? 'var(--coral)' : 'var(--text-tertiary)' }}>
                {comment.length} / 400
              </span>
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={400}
              placeholder="함께 일하며 느낀 점을 솔직하게 남겨주세요"
              style={{
                width: '100%', height: 100, padding: '10px 12px',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--border2)',
                background: 'var(--surface2)', fontSize: 13, lineHeight: 1.6,
                resize: 'none', fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none',
              }}
            />
          </div>

          {/* 버튼 */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => navigate('/review')}
              style={{
                padding: '12px 20px',
                background: 'var(--surface2)', color: 'var(--text-secondary)',
                border: 'none', borderRadius: 'var(--radius-md)',
                fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}
            >
              취소
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              style={{
                flex: 1, padding: '12px 0',
                background: submitting ? 'var(--text-tertiary)' : 'var(--green)',
                color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
                fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? '제출 중...' : '평가 제출'}
            </button>
          </div>
        </div>

        {/* ──── 우측 패널 ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 실시간 레이더 차트 */}
          <div style={{
            background: 'var(--surface)', border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: '20px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, alignSelf: 'flex-start' }}>실시간 능력치 미리보기</p>
            <RadarChart scores={scores} />
          </div>

          {/* 함께 평가할 팀원 */}
          {evaluableMembers.length > 0 && (
            <div style={{
              background: 'var(--surface)', border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius-xl)', padding: '16px 18px',
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>함께 평가할 팀원</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {evaluableMembers.map(m => {
                  const isCurrent = m.userId === numRevieweeId;
                  const isDone = evaluatedIds.has(m.userId);
                  return (
                    <div
                      key={m.userId}
                      onClick={() => {
                        if (!isCurrent && !isDone) navigate(`/evaluate/${numProjectId}/${m.userId}`);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 10px', borderRadius: 'var(--radius-md)',
                        background: isCurrent ? 'var(--green-light)' : 'transparent',
                        cursor: isCurrent || isDone ? 'default' : 'pointer',
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: isCurrent ? 'var(--green)' : isDone ? 'var(--surface2)' : 'var(--surface2)',
                        color: isCurrent ? '#fff' : 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700,
                      }}>
                        {m.name[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600,
                          color: isCurrent ? 'var(--green-dark)' : 'var(--text-primary)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {m.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{m.department}</div>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, flexShrink: 0,
                        background: isCurrent ? 'var(--green)' : isDone ? 'var(--surface2)' : 'var(--amber-light)',
                        color: isCurrent ? '#fff' : isDone ? 'var(--text-tertiary)' : 'var(--amber-dark)',
                      }}>
                        {isCurrent ? '진행 중' : isDone ? '완료' : '미완료'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 수행 태스크 모달 */}
      {showTasksModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '0 16px' }}
          onClick={() => setShowTasksModal(false)}
        >
          <div
            style={{ background: 'var(--surface)', borderRadius: 20, padding: '24px 24px 20px', width: '100%', maxWidth: 420, boxShadow: '0 12px 40px rgba(0,0,0,0.2)', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>{revieweeName}님의 수행 태스크</h3>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{project.title}</p>
              </div>
              <button
                onClick={() => setShowTasksModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4, display: 'flex' }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4l10 10M14 4L4 14" />
                </svg>
              </button>
            </div>
            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {revieweeTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-tertiary)', fontSize: 14 }}>
                  수행한 태스크가 없습니다.
                </div>
              ) : revieweeTasks.map(task => {
                const statusMap: Record<string, { label: string; bg: string; color: string }> = {
                  todo:        { label: '예정',    bg: 'var(--surface2)',    color: 'var(--text-tertiary)' },
                  in_progress: { label: '진행 중', bg: 'var(--amber-light)', color: 'var(--amber-dark)' },
                  done:        { label: '완료',    bg: 'var(--green-light)', color: 'var(--green-dark)' },
                };
                const s = statusMap[task.status] ?? statusMap.todo;
                return (
                  <div key={task.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 'var(--radius-md)',
                    background: 'var(--surface2)',
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px',
                      borderRadius: 999, background: s.bg, color: s.color, flexShrink: 0,
                    }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>
                      {task.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 완료 모달 */}
      {submitted && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '36px 32px 28px', width: 360, boxShadow: '0 12px 40px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'var(--green-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>평가가 완료되었습니다!</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}>
              {revieweeName}님에 대한 동료 평가가<br />성공적으로 제출되었어요.
            </p>
            <button
              onClick={() => navigate('/review')}
              style={{
                width: '100%', padding: '13px 0',
                background: 'var(--green)', color: '#fff',
                border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
