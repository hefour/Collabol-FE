import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { projectsApi, toProject } from "../api/projects";
import { evaluationsApi } from "../api/evaluations";
import { teamApi } from "../api/team";
import type { Project } from "../types";

const CATEGORIES = [
  { key: 'presentationScore',  label: '발표력' },
  { key: 'sincerityScore',     label: '성실성' },
  { key: 'communicationScore', label: '커뮤니케이션' },
  { key: 'planningScore',      label: '기획력' },
  { key: 'collaborationScore', label: '협업태도' },
] as const;

type ScoreKey = typeof CATEGORIES[number]['key'];

export default function EvaluatePage() {
  const { project: projectId, userId: revieweeId } = useParams();
  const navigate = useNavigate();

  const [project, setProject]       = useState<Project | null>(null);
  const [revieweeName, setRevieweeName] = useState('');
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [scores, setScores] = useState<Record<ScoreKey, number>>({
    presentationScore: 0, sincerityScore: 0, communicationScore: 0,
    planningScore: 0, collaborationScore: 0,
  });
  const [comment, setComment] = useState("");

  const numProjectId = Number(projectId);
  const numRevieweeId = Number(revieweeId);

  useEffect(() => {
    if (!projectId || isNaN(numProjectId) || isNaN(numRevieweeId)) {
      setLoading(false);
      return;
    }
    Promise.all([
      projectsApi.get(numProjectId),
      teamApi.members(numProjectId),
    ]).then(([proj, members]) => {
      setProject(toProject(proj));
      const reviewee = members.find(m => m.userId === numRevieweeId);
      setRevieweeName(reviewee?.name ?? '');
    }).finally(() => setLoading(false));
  }, [numProjectId, numRevieweeId]);

  if (loading) return <div style={{ padding: '20px 16px' }} className="md-page-padding">불러오는 중...</div>;

  if (!project || isNaN(numRevieweeId)) {
    return <div style={{ padding: '20px 16px' }} className="md-page-padding">존재하지 않는 프로젝트입니다.</div>;
  }

  const setScore = (key: ScoreKey, value: number) => setScores(prev => ({ ...prev, [key]: value }));

  const statusLabel = (s: string) => {
    if (s === 'in_progress') return '진행 중';
    if (s === 'completed')            return '평가 대기';
    if (s === 'evaluation_completed') return '평가 완료';
    return '모집 중';
  };

  async function submit() {
    if (!CATEGORIES.every(c => scores[c.key] > 0)) {
      alert("모든 평가 항목을 1점 이상 선택해주세요.");
      return;
    }
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

      {/* ── 페이지 헤더 ── */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => navigate("/review")}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', fontSize: 13, padding: 0, marginBottom: 12,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 2L4 7l5 5" />
          </svg>
          동료 평가로 돌아가기
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>동료 평가하기</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          함께한 팀원에게 솔직한 피드백을 남겨주세요
        </p>
      </div>

      {/* ── 프로젝트 + 대상자 카드 ── */}
      <div style={{
        padding: '16px 20px',
        background: 'var(--surface)', border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{project.title}</h2>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '2px 9px',
            borderRadius: 999, background: 'var(--surface2)', color: 'var(--text-secondary)',
          }}>
            {statusLabel(project.status)}
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>{project.description}</p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px',
          background: 'var(--green-light)', borderRadius: 'var(--radius-md)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'var(--green)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700,
          }}>
            {revieweeName ? revieweeName[0] : '?'}
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--green-mid)', fontWeight: 500, marginBottom: 2 }}>평가 대상</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green-dark)' }}>
              {revieweeName || '팀원'}
            </div>
          </div>
        </div>
      </div>

      {/* ── 평가 항목 ── */}
      <div style={{
        background: 'var(--surface)', border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '20px 22px', marginBottom: 16,
      }}>
        <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>협업 역량 평가</p>
        {CATEGORIES.map(({ key, label }) => (
          <div key={key} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>{label}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setScore(key, n)}
                  style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${scores[key] === n ? 'var(--green)' : 'var(--border2)'}`,
                    background: scores[key] === n ? 'var(--green)' : 'var(--surface)',
                    color: scores[key] === n ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── 코멘트 ── */}
      <div style={{
        background: 'var(--surface)', border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: '20px 22px', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 15, fontWeight: 700 }}>코멘트</p>
          <span style={{ fontSize: 12, color: comment.length > 800 ? 'var(--coral)' : 'var(--text-tertiary)' }}>
            {comment.length} / 1000
          </span>
        </div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={1000}
          placeholder="함께 일하며 느낀 점을 솔직하게 남겨주세요 (선택)"
          style={{
            width: '100%', height: 100, padding: '10px 12px',
            borderRadius: 'var(--radius-md)', border: '1px solid var(--border2)',
            background: 'var(--surface2)', fontSize: 13, lineHeight: 1.6,
            resize: 'none', fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none',
          }}
        />
      </div>

      {/* ── 버튼 ── */}
      <div style={{ display: 'flex', gap: 10 }}>
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
        <button
          onClick={() => navigate("/review")}
          style={{
            padding: '12px 20px',
            background: 'var(--surface2)', color: 'var(--text-secondary)',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}
        >
          취소
        </button>
      </div>

      {/* ── 평가 완료 모달 ── */}
      {submitted && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '36px 32px 28px', width: 360, boxShadow: '0 12px 40px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>✅</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.4px' }}>평가가 완료되었습니다!</h2>
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
