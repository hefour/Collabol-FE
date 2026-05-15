import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { projects, users } from "../data/mockData";

type Task = {
  id: string;
  title: string;
  desc: string;
  assignee: string;
  done: boolean;
  createdAt: string;
};

export default function ProjectDetailPage() {
  const { project } = useParams();
  const navigate = useNavigate();

  const currentProject = projects.find((p) => p.id === project);

  const role = "leader";

  const [status] = useState(
    currentProject?.status || "in_progress"
  );

  const startDate = currentProject?.startDate || "";
  const endDate = currentProject?.endDate || null;

  const [tasks, setTasks] = useState<Task[]>([]);

  const [form, setForm] = useState({
    title: "",
    desc: "",
    assignee: "",
  });

  const [inviteOpen, setInviteOpen] = useState(false);

  if (!currentProject) {
    return (
      <div style={{ padding: 24 }}>
        존재하지 않는 프로젝트입니다.
      </div>
    );
  }

  const isLocked = status === "completed";

  const statusLabel = (s: string) => {
    switch (s) {
      case "in_progress":
        return "진행 중";
      case "recruiting":
        return "평가 대기";
      case "completed":
        return "평가 완료";
      default:
        return s;
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "in_progress":
        return "#16a34a";
      case "recruiting":
        return "#f59e0b";
      case "completed":
        return "#2563eb";
      default:
        return "#999";
    }
  };

  const team =
    currentProject.members?.map((m) => {
      const user = users.find((u) => u.id === m.userId);
      return {
        name: user?.name || m.name,
        role: m.role,
      };
    }) || [];

  const addTask = () => {
    if (isLocked) return;

    setTasks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        ...form,
        done: false,
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ]);

    setForm({ title: "", desc: "", assignee: "" });
  };

  const toggleDone = (id: string) => {
    if (isLocked) return;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    );
  };

  const doneCount = tasks.filter((t) => t.done).length;

  // 🔥 핵심 수정: 평가/완료 상태면 100%
  const progress =
    status === "recruiting" || status === "completed"
      ? 100
      : tasks.length === 0
      ? 0
      : Math.round((doneCount / tasks.length) * 100);

  return (
    <div style={{ padding: 24 }}>
      <button
        onClick={() => navigate("/projects")}
        style={{
          marginBottom: 16,
          padding: "8px 12px",
          background: "#ddd",
          border: "none",
          borderRadius: 6,
        }}
      >
        ← 프로젝트 목록
      </button>

      {/* 🔥 제목 + 설명 강조 */}
      <div
        style={{
          padding: 20,
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          marginBottom: 16,
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>
          {currentProject.title}
        </h1>

        <p style={{ marginTop: 6, color: "#555" }}>
          {currentProject.description}
        </p>
      </div>

      {/* 상태 */}
      <div style={{ marginBottom: 10 }}>
        상태:{" "}
        <b
          style={{
            background: statusColor(status),
            color: "white",
            padding: "4px 10px",
            borderRadius: 999,
          }}
        >
          {statusLabel(status)}
        </b>
      </div>

      <p>시작일: {startDate}</p>
      {endDate && <p>종료일: {endDate}</p>}

      {/* 진행률 */}
      <div style={{ marginTop: 16 }}>
        <h3>진행률</h3>

        <div
          style={{
            width: "100%",
            height: 12,
            background: "#eee",
            borderRadius: 999,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#22c55e",
              transition: "0.3s",
              borderRadius: 999,
            }}
          />
        </div>

        <p style={{ fontSize: 12 }}>
          {progress}% ({doneCount}/{tasks.length})
        </p>
      </div>

      {/* 초대 링크 */}
      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => setInviteOpen(!inviteOpen)}
          style={{
            padding: "10px 14px",
            background: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: 8,
          }}
        >
          🔗 초대 링크
        </button>

        {inviteOpen && (
          <p style={{ marginTop: 8 }}>
            {`${window.location.origin}/invite/${currentProject.id}`}
          </p>
        )}
      </div>

      {/* 팀원 */}
      <h3 style={{ marginTop: 20 }}>팀원</h3>
      {team.map((m, i) => (
        <div key={i}>
          {m.name} - {m.role}
        </div>
      ))}

      {/* 태스크 추가 */}
      {!isLocked && role === "leader" && (
        <div style={{ marginTop: 20 }}>
          <h3>태스크 추가</h3>

          <input
            placeholder="제목"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <input
            placeholder="설명"
            value={form.desc}
            onChange={(e) =>
              setForm({ ...form, desc: e.target.value })
            }
          />

          <input
            placeholder="담당자"
            value={form.assignee}
            onChange={(e) =>
              setForm({ ...form, assignee: e.target.value })
            }
          />

          <button onClick={addTask}>추가</button>
        </div>
      )}

      {/* 태스크 */}
      <h3 style={{ marginTop: 30 }}>태스크</h3>

      {tasks.map((t) => (
        <div
          key={t.id}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            marginTop: 10,
            borderRadius: 10,
          }}
        >
          <h4>
            {t.title} {t.done && "✅"}
          </h4>
          <p>{t.desc}</p>
          <p>담당: {t.assignee}</p>

          <button onClick={() => toggleDone(t.id)}>
            완료 체크
          </button>
        </div>
      ))}
    </div>
  );
}