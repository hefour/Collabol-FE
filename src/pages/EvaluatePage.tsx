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
      <div style={{ padding: 24 }}>
        존재하지 않는 프로젝트입니다.
      </div>
    );
  }

  const [scores, setScores] = useState<Record<string, number>>({
    발표력: 0,
    성실성: 0,
    커뮤니케이션: 0,
    기획력: 0,
    협업태도: 0,
  });

  const [comment, setComment] = useState("");

  const setScore = (key: string, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const submit = () => {
    const allFilled = categories.every((c) => scores[c] > 0);

    if (!allFilled) {
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
    navigate("/projects");
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "in_progress":
        return "진행 중";
      case "recruiting":
        return "평가 대기";
      case "completed":
        return "평가 완료";
      default:
        return "알 수 없음";
    }
  };

  return (
    <div style={{ padding: 24 }}>

      {/* 헤더 */}
      <div
        style={{
          padding: 20,
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>
          {currentProject.title} 평가하기
        </h1>

        <p style={{ color: "#666", marginTop: 6 }}>
          상태: <b>{statusLabel(currentProject.status)}</b>
        </p>

        <p style={{ color: "#999", fontSize: 13 }}>
          {currentProject.description}
        </p>
      </div>

      {/* 평가 항목 */}
      <div style={{ marginTop: 20 }}>
        {categories.map((c) => (
          <div key={c} style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 600 }}>{c}</p>

            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setScore(c, n)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    background:
                      scores[c] === n ? "#22c55e" : "white",
                    color: scores[c] === n ? "white" : "black",
                    cursor: "pointer",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 코멘트 */}
      <div style={{ marginTop: 20 }}>
        <p style={{ fontWeight: 600 }}>
          코멘트 (선택 / 100자 이내)
        </p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={100}
          style={{
            width: "100%",
            height: 100,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* 버튼 */}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button
          onClick={submit}
          style={{
            padding: "10px 16px",
            background: "black",
            color: "white",
            border: "none",
            borderRadius: 8,
          }}
        >
          제출
        </button>

        <button
          onClick={() => navigate("/projects")}
          style={{
            padding: "10px 16px",
            background: "#ddd",
            color: "black",
            border: "none",
            borderRadius: 8,
          }}
        >
          나가기
        </button>
      </div>
    </div>
  );
}