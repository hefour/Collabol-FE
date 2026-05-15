import { useNavigate } from "react-router-dom";
import { projects } from "../data/mockData";
import type { Project } from "../types";

const STATUS_LABEL: Record<Project["status"], string> = {
  in_progress: "진행 중",
  recruiting: "평가 대기",
  completed: "평가 완료",
};

export default function ProjectsPage() {
  const navigate = useNavigate();

  const handleReviewClick = (project: Project) => {
    navigate(`/review/${project.id}`);
  };

  const handleEvaluateClick = (project: Project) => {
    navigate(`/evaluate/${project.id}`);
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "in_progress":
        return "#16a34a";

      case "recruiting":
        return "#f59e0b";

      case "completed":
        return "#2563eb";

      default:
        return "#666";
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>
        프로젝트
      </h1>

      {projects.map((p) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>
              {p.title}
            </h2>

            <span
              style={{
                background: getStatusColor(p.status),
                color: "white",
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {STATUS_LABEL[p.status]}
            </span>
          </div>

          <p style={{ color: "#666", marginTop: 8 }}>
            {p.description}
          </p>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              onClick={() => navigate(`/projects/${p.id}`)}
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: 8,
                background: "black",
                color: "white",
                cursor: "pointer",
              }}
            >
              상세보기
            </button>

            {p.status === "recruiting" && (
              <button
                onClick={() => handleEvaluateClick(p)}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: 8,
                  background: "#f59e0b",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                평가하기
              </button>
            )}

            {p.status === "completed" && (
              <button
                onClick={() => handleReviewClick(p)}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: 8,
                  background: "#4CAF50",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                동료 평가 보기
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
