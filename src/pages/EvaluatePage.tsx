import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { projects } from "../data/mockData";

const categories = [
  "발표력",
  "성실성",
  "커뮤니케이션",
  "기획력",
  "협업태도",
] as const;

export default function EvaluatePage() {
  const { project } = useParams();
  const navigate = useNavigate();

  const currentProject = projects.find((p) => p.id === project);

  if (!currentProject) {
    return (
      <div style={{ padding: '20px 16px' }} className="md-page-padding">
        존재하지 않는 프로젝트입니다.
      </div>
    );
  }

  const [scores, setScores] = useState<Record<string, number>>({
    발표력: 0, 성실성: 0, 커뮤니케이션: 0, 기획력: 0, 협업태도: 0,
  });
  const [comment, setComment] = useState("");

  const setScore = (key: string, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const submit = () => {
    if (!categories.every((c) => scores[c] > 0)) {
      alert("모든 평가 항목을 1점 이상 선택해주세요.");
      return;
    }
    if (comment.length > 100) {
      alert("코멘트는 100자 이내로 작성해야 합니다.");
      return;
    }
    console.log("project:", currentProject.title);
    console.log("scores:", scores);
    console.log("comment:", comment);
    alert("평가가 저장되었습니다.");
    navigate("/review");
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "in_progress": return "진행 중";
      case "recruiting":  return "모집 중";
      case "completed":   return "완료";
      default:            return "알 수 없음";
    }
  };

  return (
    <div style={{ padding: '20px 16px' }} className="md-page-padding">

      {/* ── 페이지 헤더 ── */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => navigate("/review")}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', fontSize: 13, padding: 0,
            marginBottom: 12,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 2L4 7l5 5" />
          </svg>
          동료 평가로 돌아가기
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          동료 평가하기
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          함께한 팀원에게 솔직한 피드백을 남겨주세요
        </p>
      </div>

      {/* ── 프로젝트 정보 카드 ── */}
      <div style={{
        padding: '16px 20px',
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>{currentProject.title}</h2>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '2px 9px',
            borderRadius: 999, background: 'var(--surface2)',
            color: 'var(--text-secondary)',
          }}>
            {statusLabel(currentProject.status)}
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {currentProject.description}
        </p>
      </div>

      {/* ── 평가 항목 ── */}
      <div style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 22px',
        marginBottom: 16,
      }}>
        <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>협업 역량 평가</p>
        {categories.map((c) => (
          <div key={c} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
              {c}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setScore(c, n)}
                  style={{
                    width: 44, height: 44,
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${scores[c] === n ? 'var(--green)' : 'var(--border2)'}`,
                    background: scores[c] === n ? 'var(--green)' : 'var(--surface)',
                    color: scores[c] === n ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: 15,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
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
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 22px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 15, fontWeight: 700 }}>코멘트</p>
          <span style={{ fontSize: 12, color: comment.length > 80 ? 'var(--coral)' : 'var(--text-tertiary)' }}>
            {comment.length} / 100
          </span>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={100}
          placeholder="함께 일하며 느낀 점을 솔직하게 남겨주세요 (선택)"
          style={{
            width: '100%', height: 100,
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border2)',
            background: 'var(--surface2)',
            fontSize: 13, lineHeight: 1.6,
            resize: 'none', fontFamily: 'inherit',
            color: 'var(--text-primary)', outline: 'none',
          }}
        />
      </div>

      {/* ── 버튼 ── */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={submit}
          style={{
            flex: 1, padding: '12px 0',
            background: 'var(--green)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}
        >
          평가 제출
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
    </div>
  );
}
