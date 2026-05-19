import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  projects,
  users,
  currentUser,
  tasks as allTasks,
  activities,
} from "../data/mockData";
import type { Task } from "../types";

const MEMBER_COLORS = ["#1D9E75", "#3B82F6", "#8B5CF6", "#F97316"];

function DonutChart({ percent }: { percent: number }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const filled = circ * (percent / 100);
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle
        cx="60" cy="60" r={r}
        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10"
      />
      <circle
        cx="60" cy="60" r={r}
        fill="none" stroke="white" strokeWidth="10"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <text
        x="60" y="55"
        textAnchor="middle" fill="white"
        fontSize="20" fontWeight="700"
        fontFamily="Pretendard, sans-serif"
      >
        {percent}%
      </text>
      <text
        x="60" y="72"
        textAnchor="middle" fill="rgba(255,255,255,0.7)"
        fontSize="10" fontFamily="Pretendard, sans-serif"
      >
        전체 진행률
      </text>
    </svg>
  );
}

type FilterType = "all" | "in_progress" | "done" | "delayed";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "in_progress", label: "진행 중" },
  { key: "done", label: "완료" },
  { key: "delayed", label: "지연" },
];

function TaskCheckbox({ done, color }: { done: boolean; color: string }) {
  return (
    <div
      style={{
        width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
        background: done ? color : "transparent",
        border: `2px solid ${done ? color : "#D1D5DB"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {done && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path
            d="M1 3l2 2 4-4"
            stroke="white" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

function MemberTaskCard({
  name, email, role, color, tasks, filter,
}: {
  name: string;
  email: string;
  role: string;
  color: string;
  tasks: Task[];
  filter: FilterType;
}) {
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const progressPct =
    tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const handle = email.split("@")[0];
  const initials = name.slice(0, 2);

  const visibleTasks = useMemo(() => {
    const now = new Date();
    if (filter === "all") return tasks;
    if (filter === "delayed")
      return tasks.filter(
        (t) =>
          t.status !== "done" &&
          t.dueDate &&
          new Date(t.dueDate) < now
      );
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  if (filter !== "all" && visibleTasks.length === 0) return null;

  return (
    <div
      style={{
        background: "white", borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden",
      }}
    >
      <div style={{ borderLeft: `4px solid ${color}`, padding: "14px 16px" }}>
        {/* Card header */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 36, height: 36, borderRadius: "50%", background: color,
              flexShrink: 0, display: "flex", alignItems: "center",
              justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
            <div style={{ fontSize: 12, color: "#A0A0A0" }}>
              @{handle} · {role}
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color, flexShrink: 0 }}>
            {doneTasks}/{tasks.length}
          </div>
        </div>

        {/* Mini progress bar */}
        <div
          style={{
            height: 4, background: "#F0EFE9", borderRadius: 999, marginBottom: 12,
          }}
        >
          <div
            style={{
              height: "100%", width: `${progressPct}%`,
              background: color, borderRadius: 999,
            }}
          />
        </div>

        {/* Task list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {visibleTasks.length === 0 ? (
            <div
              style={{
                fontSize: 13, color: "#A0A0A0", textAlign: "center", padding: "6px 0",
              }}
            >
              해당하는 태스크 없음
            </div>
          ) : (
            visibleTasks.map((task) => (
              <div
                key={task.id}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <TaskCheckbox done={task.status === "done"} color={color} />
                <span
                  style={{
                    flex: 1, fontSize: 13,
                    color: task.status === "done" ? "#A0A0A0" : "#1A1A1A",
                    textDecoration:
                      task.status === "done" ? "line-through" : "none",
                  }}
                >
                  {task.title}
                </span>
                {task.dueDate && (
                  <span
                    style={{ fontSize: 11, color: "#A0A0A0", flexShrink: 0 }}
                  >
                    {task.dueDate.slice(5).replace("-", ".")}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  in_progress: "진행 중",
  recruiting: "평가 대기",
  completed: "완료",
};

export default function ProjectDetailPage() {
  const { project: projectId } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>("all");
  const [inviteOpen, setInviteOpen] = useState(false);

  // TODO: 백엔드 연결 시 → GET /api/v1/projects/:id
  const proj = projects.find((p) => p.id === projectId);
  if (!proj)
    return (
      <div style={{ padding: 24, color: "#A0A0A0" }}>
        존재하지 않는 프로젝트입니다.
      </div>
    );

  // TODO: 백엔드 연결 시 → GET /api/v1/tasks?projectId=:id
  const projectTasks = allTasks.filter((t) => t.projectId === projectId);

  const doneTasks = projectTasks.filter((t) => t.status === "done").length;
  const inProgressTasks = projectTasks.filter(
    (t) => t.status === "in_progress"
  ).length;
  const progress =
    projectTasks.length > 0
      ? Math.round((doneTasks / projectTasks.length) * 100)
      : 0;

  const today = new Date();
  const dueDate = proj.dueDate ? new Date(proj.dueDate) : null;
  const daysLeft = dueDate
    ? Math.max(
        0,
        Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      )
    : null;

  // 멤버별 태스크 그룹
  const memberGroups = proj.members.map((member, i) => {
    const user =
      member.userId === currentUser.id
        ? currentUser
        : users.find((u) => u.id === member.userId);
    const memberTasks = projectTasks.filter(
      (t) => t.assigneeId === member.userId
    );
    return {
      member,
      user,
      tasks: memberTasks,
      color: MEMBER_COLORS[i % MEMBER_COLORS.length],
    };
  });

  // 다가오는 마감 (미완료 태스크, dueDate 순)
  const upcomingDeadlines = [...projectTasks]
    .filter((t) => t.status !== "done" && t.dueDate)
    .sort(
      (a, b) =>
        new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    )
    .slice(0, 5);

  // 최근 활동
  // TODO: 백엔드 연결 시 → GET /api/v1/projects/:id/activities
  const projectActivities = activities
    .filter((a) => a.projectId === projectId)
    .slice(0, 4);

  return (
    <div
      style={{
        padding: "28px 32px", minHeight: "100vh", background: "var(--bg)",
      }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 13, color: "#A0A0A0", marginBottom: 20,
        }}
      >
        <button
          onClick={() => navigate("/projects")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#A0A0A0", fontSize: 13, padding: 0,
          }}
        >
          프로젝트
        </button>
        <span>›</span>
        <span style={{ color: "#1A1A1A", fontWeight: 600 }}>{proj.title}</span>
      </div>

      {/* Project banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)",
          borderRadius: 20, padding: "28px 32px", marginBottom: 20,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          color: "white",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                  stroke="white" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                />
                <polyline
                  points="14 2 14 8 20 8"
                  stroke="white" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                />
                <line x1="16" y1="13" x2="8" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="16" y1="17" x2="8" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
                {proj.title}
              </h1>
              <p
                style={{
                  fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4, lineHeight: 1.5,
                }}
              >
                {proj.description}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div
            style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}
          >
            {proj.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: "rgba(255,255,255,0.2)", borderRadius: 999,
                  padding: "3px 10px", fontSize: 12, fontWeight: 600,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Meta info */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: 18,
              fontSize: 13, color: "rgba(255,255,255,0.8)", flexWrap: "wrap",
            }}
          >
            <span>
              📅 {proj.startDate} ~ {proj.dueDate ?? "미정"}
            </span>
            <span>👥 {proj.members.length}명</span>
            <span
              style={{
                background: "rgba(255,255,255,0.15)", padding: "2px 10px",
                borderRadius: 6, fontWeight: 600,
              }}
            >
              {STATUS_LABEL[proj.status] ?? proj.status}
            </span>
          </div>

          {/* Share / invite button */}
          <button
            onClick={() => setInviteOpen((prev) => !prev)}
            style={{
              marginTop: 18, padding: "8px 18px",
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: 8, color: "white",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            🔗 공유 / 초대
          </button>
          {inviteOpen && (
            <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
              {window.location.origin}/invite/{proj.id}
            </div>
          )}
        </div>

        {/* Donut chart */}
        <div
          style={{ flexShrink: 0, marginLeft: 28, textAlign: "center" }}
        >
          <DonutChart percent={progress} />
          <div
            style={{
              display: "flex", gap: 12, marginTop: 8, justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 11, color: "rgba(255,255,255,0.7)",
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <span
                style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "white", display: "inline-block",
                }}
              />
              완료 {doneTasks}개
            </span>
            <span
              style={{
                fontSize: 11, color: "rgba(255,255,255,0.7)",
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <span
                style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "rgba(255,255,255,0.4)", display: "inline-block",
                }}
              />
              진행 {inProgressTasks}개
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12, marginBottom: 24,
        }}
      >
        <StatCard
          label="완료 태스크"
          value={doneTasks}
          unit="개"
          sub={`전체 ${projectTasks.length}개`}
          subColor="#1D9E75"
        />
        <StatCard
          label="남은 기간"
          value={daysLeft ?? "-"}
          unit={daysLeft !== null ? "일" : ""}
          sub={proj.dueDate ? `📅 ${proj.dueDate}` : "기한 미정"}
        />
        <StatCard
          label="진행 중"
          value={inProgressTasks}
          unit="개"
          sub={`전체의 ${
            projectTasks.length > 0
              ? Math.round((inProgressTasks / projectTasks.length) * 100)
              : 0
          }%`}
          subColor="#3B82F6"
        />
        <StatCard
          label="팀원"
          value={proj.members.length}
          unit="명"
          sub="프로젝트 참여 중"
        />
      </div>

      {/* Main content: tasks (left) + right panel */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Left: member task section */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              담당자별 태스크{" "}
              <span style={{ color: "#A0A0A0", fontWeight: 400 }}>
                ({projectTasks.length})
              </span>
            </h2>

            {/* Filter tabs */}
            <div
              style={{
                display: "flex", background: "white", borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden",
              }}
            >
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: "6px 12px", fontSize: 13, border: "none",
                    cursor: "pointer",
                    background: filter === f.key ? "#1D9E75" : "transparent",
                    color: filter === f.key ? "white" : "#6B6B6B",
                    fontWeight: filter === f.key ? 600 : 400,
                    transition: "background 0.15s",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Member task cards grid */}
          <div
            style={{
              display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14,
            }}
          >
            {memberGroups.map(({ member, user, tasks: memberTasks, color }) => (
              <MemberTaskCard
                key={member.userId}
                name={user?.name ?? member.name}
                email={user?.email ?? `${member.userId}@soongsil.ac.kr`}
                role={member.role}
                color={color}
                tasks={memberTasks}
                filter={filter}
              />
            ))}
          </div>

          {filter !== "all" &&
            memberGroups.every(({ tasks: mt }) => {
              const now = new Date();
              const visible =
                filter === "delayed"
                  ? mt.filter(
                      (t) =>
                        t.status !== "done" &&
                        t.dueDate &&
                        new Date(t.dueDate) < now
                    )
                  : mt.filter((t) => t.status === filter);
              return visible.length === 0;
            }) && (
              <div
                style={{
                  textAlign: "center", padding: "40px 0",
                  color: "#A0A0A0", fontSize: 14,
                }}
              >
                해당하는 태스크가 없습니다
              </div>
            )}
        </div>

        {/* Right panel */}
        <div
          style={{
            width: 260, flexShrink: 0, display: "flex",
            flexDirection: "column", gap: 16,
          }}
        >
          {/* 다가오는 마감 */}
          <div
            style={{
              background: "white", borderRadius: 14, padding: "18px 20px",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700 }}>
                다가오는 마감
              </span>
              <span style={{ fontSize: 12, color: "#1D9E75" }}>전체</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {upcomingDeadlines.length === 0 ? (
                <div
                  style={{ fontSize: 13, color: "#A0A0A0", textAlign: "center" }}
                >
                  마감 임박 태스크 없음
                </div>
              ) : (
                upcomingDeadlines.map((task) => {
                  const due = new Date(task.dueDate!);
                  const day = due.getDate();
                  const isUrgent =
                    due.getTime() - today.getTime() <
                    3 * 24 * 60 * 60 * 1000;
                  return (
                    <div
                      key={task.id}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          background: isUrgent ? "#FAECE7" : "#E1F5EE",
                          display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 13, fontWeight: 700,
                          color: isUrgent ? "#D85A30" : "#1D9E75",
                        }}
                      >
                        {day}
                      </div>
                      <span
                        style={{
                          fontSize: 13, flex: 1, minWidth: 0,
                          overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {task.title}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 최근 활동 */}
          <div
            style={{
              background: "white", borderRadius: 14, padding: "18px 20px",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700 }}>최근 활동</span>
              <span style={{ fontSize: 12, color: "#1D9E75" }}>전체</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {projectActivities.length === 0 ? (
                <div
                  style={{ fontSize: 13, color: "#A0A0A0", textAlign: "center" }}
                >
                  활동 내역 없음
                </div>
              ) : (
                projectActivities.map((act, i) => {
                  const actUser =
                    act.userId === currentUser.id
                      ? currentUser
                      : users.find((u) => u.id === act.userId);
                  const initials = (actUser?.name ?? "?").slice(0, 2);
                  const colorIdx = proj.members.findIndex(
                    (m) => m.userId === act.userId
                  );
                  const actColor =
                    MEMBER_COLORS[
                      colorIdx >= 0 ? colorIdx % MEMBER_COLORS.length : 0
                    ];
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex", gap: 10, alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: actColor, flexShrink: 0,
                          display: "flex", alignItems: "center",
                          justifyContent: "center",
                          color: "white", fontWeight: 700, fontSize: 11,
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                          <b>{actUser?.name ?? "알 수 없음"}</b> 님이{" "}
                          {act.action}
                        </div>
                        <div
                          style={{ fontSize: 11, color: "#A0A0A0", marginTop: 2 }}
                        >
                          {act.createdAt.slice(0, 10)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 프로젝트 수정/삭제 */}
          {/* TODO: 백엔드 연결 시 → PUT /api/v1/projects/:id, DELETE /api/v1/projects/:id */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={{
                flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 13,
                fontWeight: 600, cursor: "pointer", border: "1px solid rgba(0,0,0,0.1)",
                background: "white", color: "#1A1A1A",
              }}
            >
              프로젝트 수정
            </button>
            <button
              style={{
                flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 13,
                fontWeight: 600, cursor: "pointer", border: "none",
                background: "#FAECE7", color: "#D85A30",
              }}
            >
              프로젝트 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, unit, sub, subColor,
}: {
  label: string;
  value: number | string;
  unit: string;
  sub: string;
  subColor?: string;
}) {
  return (
    <div
      style={{
        background: "white", borderRadius: 14, padding: "18px 20px",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontSize: 12, color: "#A0A0A0", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>
        {value}
        <span style={{ fontSize: 14, fontWeight: 400, color: "#A0A0A0" }}>
          {unit}
        </span>
      </div>
      <div
        style={{ fontSize: 12, color: subColor ?? "#A0A0A0", marginTop: 6 }}
      >
        {sub}
      </div>
    </div>
  );
}
