import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { projectsApi, toProject } from "../api/projects";
import { tasksApi, toTask } from "../api/tasks";
import { teamApi, toProjectMember, type TeamMemberResponse } from "../api/team";
import type { Project, Task, ProjectMember } from "../types";

const MEMBER_COLORS = ["#1D9E75", "#3B82F6", "#8B5CF6", "#F97316"];

function DonutChart({ percent }: { percent: number }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const filled = circ * (percent / 100);
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
      <circle
        cx="60" cy="60" r={r}
        fill="none" stroke="white" strokeWidth="10"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="55" textAnchor="middle" fill="white" fontSize="20" fontWeight="700" fontFamily="Pretendard, sans-serif">
        {percent}%
      </text>
      <text x="60" y="72" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontFamily="Pretendard, sans-serif">
        전체 진행률
      </text>
    </svg>
  );
}

type FilterType = "all" | "in_progress" | "done";
const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "in_progress", label: "진행 중" },
  { key: "done", label: "완료" },
];

function TaskCheckbox({ done, color }: { done: boolean; color: string }) {
  return (
    <div style={{
      width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
      background: done ? color : "transparent",
      border: `2px solid ${done ? color : "#D1D5DB"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {done && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

const STATUS_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  todo:        { label: '예정',    bg: '#F0EFE9', color: '#888' },
  in_progress: { label: '진행 중', bg: '#E1F5EE', color: '#1D9E75' },
  done:        { label: '완료',    bg: '#EEF2FF', color: '#6366F1' },
};

function MemberTaskCard({
  name, email, role, color, tasks, filter, onStatusChange, onAssigneeChange, members,
}: {
  name: string; email: string; role: string; color: string;
  tasks: Task[]; filter: FilterType;
  onStatusChange: (taskId: string, next: string) => void;
  onAssigneeChange: (task: Task, assigneeId: string) => void;
  members: { userId: number; name: string }[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const doneTasks = tasks.filter(t => t.status === "done").length;
  const progressPct = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const handle = email.split("@")[0];
  const initials = name.slice(0, 2);

  const visibleTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter(t => t.status === filter);
  }, [tasks, filter]);

  if (filter !== "all" && visibleTasks.length === 0) return null;

  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
      <div style={{ borderLeft: `4px solid ${color}`, padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: color, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 700, fontSize: 13,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>@{handle} · {role}</div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, color, flexShrink: 0 }}>
            {doneTasks}/{tasks.length}
          </div>
        </div>
        <div style={{ height: 4, background: "#F0EFE9", borderRadius: 999, marginBottom: 12 }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: color, borderRadius: 999 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {visibleTasks.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--text-tertiary)", textAlign: "center", padding: "6px 0" }}>
              해당하는 태스크 없음
            </div>
          ) : (
            visibleTasks.map(task => {
              const isExpanded = expandedId === task.id;
              const hasDesc = !!task.description;
              return (
                <div key={task.id} style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8, cursor: hasDesc ? "pointer" : "default" }}
                    onClick={() => hasDesc && setExpandedId(isExpanded ? null : task.id)}
                  >
                    <TaskCheckbox done={task.status === "done"} color={color} />
                    <span style={{
                      flex: 1, fontSize: 13,
                      color: task.status === "done" ? "#A0A0A0" : "#1A1A1A",
                      textDecoration: task.status === "done" ? "line-through" : "none",
                      minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {task.title}
                    </span>
                    {hasDesc && (
                      <svg
                        width="12" height="12" viewBox="0 0 12 12" fill="none"
                        style={{ flexShrink: 0, transition: "transform 0.15s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", color: "#A0A0A0" }}
                      >
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    <select
                      value={task.assigneeId ?? ""}
                      onChange={e => onAssigneeChange(task, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      title="담당자 변경"
                      style={{
                        flexShrink: 0, fontSize: 11, border: "1px solid #E0E0E0",
                        borderRadius: 6, padding: "2px 4px", background: "#FAFAFA",
                        color: "#555", cursor: "pointer", maxWidth: 80,
                      }}
                    >
                      <option value="">미배정</option>
                      {members.map(m => (
                        <option key={m.userId} value={m.userId}>{m.name}</option>
                      ))}
                    </select>
                    <div style={{ display: "flex", gap: 3, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                      {(["todo", "in_progress", "done"] as const).map(s => {
                        const active = task.status === s;
                        const b = STATUS_BADGE[s];
                        return (
                          <button
                            key={s}
                            onClick={() => !active && onStatusChange(task.id, s === "todo" ? "TODO" : s === "in_progress" ? "IN_PROGRESS" : "DONE")}
                            style={{
                              padding: "2px 7px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                              border: active ? "none" : "1px solid #E0E0E0",
                              background: active ? b.bg : "transparent",
                              color: active ? b.color : "#BBB",
                              cursor: active ? "default" : "pointer",
                              transition: "all 0.12s",
                            }}
                          >
                            {b.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {isExpanded && hasDesc && (
                    <div style={{
                      marginTop: 6, marginLeft: 24,
                      padding: "8px 12px",
                      background: "#F8F8F6",
                      borderRadius: 8,
                      fontSize: 12,
                      color: "#555",
                      lineHeight: 1.7,
                      borderLeft: `2px solid ${color}`,
                    }}>
                      {task.description}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  in_progress:          "진행 중",
  recruiting:           "모집 중",
  completed:            "평가 대기",
  evaluation_completed: "평가 완료",
};

function isDone(status: string) {
  return status === 'completed' || status === 'evaluation_completed';
}

export default function ProjectDetailPage() {
  const { project: projectId } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [members, setMembers] = useState<(TeamMemberResponse & { member: ProjectMember })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [taskModal, setTaskModal] = useState(false);
  const [taskForm, setTaskForm]   = useState({ title: '', description: '', assigneeId: '' });
  const [taskCreating, setTaskCreating] = useState(false);
  const [taskFormError, setTaskFormError] = useState('');

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm]   = useState({ title: '', description: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError]   = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [completeConfirm, setCompleteConfirm] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [evalPrompt, setEvalPrompt] = useState(false);

  async function handleStatusChange(taskId: string, nextStatus: string) {
    try {
      const res = await tasksApi.updateStatus(numId, Number(taskId), nextStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? toTask(res) : t));
    } catch (err) {
      alert(err instanceof Error ? err.message : '상태 변경에 실패했습니다.');
    }
  }

  async function handleAssigneeChange(task: Task, assigneeId: string) {
    try {
      const res = await tasksApi.update(numId, Number(task.id), {
        title: task.title,
        description: task.description,
        assigneeIds: assigneeId ? [Number(assigneeId)] : [],
      });
      setTasks(prev => prev.map(t => t.id === task.id ? toTask(res) : t));
    } catch (err) {
      alert(err instanceof Error ? err.message : '담당자 변경에 실패했습니다.');
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskForm.title.trim()) { setTaskFormError('태스크 이름을 입력해주세요.'); return; }
    setTaskCreating(true);
    setTaskFormError('');
    try {
      const assigneeIds = taskForm.assigneeId ? [Number(taskForm.assigneeId)] : [];
      const res = await tasksApi.create(numId, {
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || undefined,
        assigneeIds,
      });
      setTasks(prev => [...prev, toTask(res)]);
      setTaskModal(false);
      setTaskForm({ title: '', description: '', assigneeId: '' });
    } catch (err) {
      setTaskFormError(err instanceof Error ? err.message : '태스크 생성에 실패했습니다.');
    } finally {
      setTaskCreating(false);
    }
  }

  function openEditModal() {
    if (!project) return;
    setEditForm({ title: project.title, description: project.description });
    setEditError('');
    setEditModal(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editForm.title.trim()) { setEditError('프로젝트 이름을 입력해주세요.'); return; }
    setEditSaving(true);
    setEditError('');
    try {
      const res = await projectsApi.update(numId, editForm.title.trim(), editForm.description.trim());
      setProject(toProject(res));
      setEditModal(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : '수정에 실패했습니다.');
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await projectsApi.delete(numId);
      navigate('/projects');
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다.');
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }

  async function handleComplete() {
    setCompleting(true);
    try {
      const res = await projectsApi.complete(numId);
      setProject(toProject(res));
      setCompleteConfirm(false);
      setEvalPrompt(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : '완료 처리에 실패했습니다.');
    } finally {
      setCompleting(false);
    }
  }

  const numId = Number(projectId);

  useEffect(() => {
    if (!projectId || isNaN(numId)) { setError('잘못된 프로젝트 ID'); setLoading(false); return; }

    Promise.all([
      projectsApi.get(numId),
      tasksApi.list(numId),
      teamApi.members(numId),
    ])
      .then(([proj, taskList, memberList]) => {
        setProject(toProject(proj));
        setTasks(taskList.map(toTask));
        setMembers(memberList.map(m => ({ ...m, member: toProjectMember(m) })));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [numId]);

  async function handleInviteToggle() {
    if (!inviteOpen && !inviteCode) {
      try {
        const res = await projectsApi.getInviteCode(numId);
        setInviteCode(res.inviteCode);
      } catch {
        setInviteCode('초대코드 로드 실패');
      }
    }
    setInviteOpen(prev => !prev);
  }

  if (loading) return <div style={{ padding: 24, color: "var(--text-tertiary)" }}>불러오는 중...</div>;
  if (error || !project) return <div style={{ padding: 24, color: "var(--text-tertiary)" }}>{error || '존재하지 않는 프로젝트입니다.'}</div>;

  const doneTasks      = tasks.filter(t => t.status === "done").length;
  const inProgressCount = tasks.filter(t => t.status === "in_progress").length;
  const progress       = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  const assignedTaskIds = new Set(
    members.flatMap(m => tasks.filter(t => t.assigneeId === String(m.userId)).map(t => t.id))
  );
  const unassignedTasks = tasks.filter(t => !t.assigneeId || !assignedTaskIds.has(t.id));

  const memberGroups = members.map((m, i) => ({
    member: m.member,
    raw: m,
    tasks: tasks.filter(t => t.assigneeId === String(m.userId)),
    color: MEMBER_COLORS[i % MEMBER_COLORS.length],
  }));

  return (
    <div style={{ padding: '20px 16px' }} className="md-page-padding">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-tertiary)", marginBottom: 20 }}>
        <button onClick={() => navigate("/projects")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 13, padding: 0 }}>
          프로젝트
        </button>
        <span>›</span>
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{project.title}</span>
      </div>

      {/* Project banner */}
      <div style={{
        background: "linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)",
        borderRadius: 20, padding: "28px 32px", marginBottom: 20,
        display: "flex", justifyContent: "space-between", alignItems: "flex-start", color: "white",
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{project.title}</h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4, lineHeight: 1.5 }}>{project.description}</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 13, color: "rgba(255,255,255,0.8)", flexWrap: "wrap", marginBottom: 16 }}>
            <span>👥 {members.length}명</span>
            <span style={{ background: "rgba(255,255,255,0.15)", padding: "2px 10px", borderRadius: 6, fontWeight: 600 }}>
              {STATUS_LABEL[project.status] ?? project.status}
            </span>
          </div>

          <button
            onClick={handleInviteToggle}
            style={{
              padding: "8px 18px",
              background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: 8, color: "white", fontSize: 13, fontWeight: 600,
              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            🔗 공유 / 초대
          </button>
          {inviteOpen && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.2)", padding: "10px 14px", borderRadius: 8 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", flexShrink: 0 }}>초대코드</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "monospace", flex: 1, letterSpacing: 1 }}>{inviteCode}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteCode).then(() => {
                    setInviteCopied(true);
                    setTimeout(() => setInviteCopied(false), 2000);
                  });
                }}
                style={{
                  padding: "5px 12px", borderRadius: 6, border: "none",
                  background: inviteCopied ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)",
                  color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                {inviteCopied ? "복사됨 ✓" : "복사"}
              </button>
            </div>
          )}
        </div>

        <div style={{ flexShrink: 0, marginLeft: 28, textAlign: "center" }}>
          <DonutChart percent={progress} />
          <div style={{ display: "flex", gap: 12, marginTop: 8, justifyContent: "center" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "white", display: "inline-block" }} />
              완료 {doneTasks}개
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.4)", display: "inline-block" }} />
              진행 {inProgressCount}개
            </span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="완료 태스크" value={doneTasks} unit="개" sub={`전체 ${tasks.length}개`} subColor="#1D9E75" />
        <StatCard label="진행 중" value={inProgressCount} unit="개" sub={`전체의 ${tasks.length > 0 ? Math.round(inProgressCount / tasks.length * 100) : 0}%`} subColor="#3B82F6" />
        <StatCard label="팀원" value={members.length} unit="명" sub="프로젝트 참여 중" />
        <StatCard label="전체 진행률" value={`${progress}`} unit="%" sub={`태스크 기준`} subColor="#1D9E75" />
      </div>

      {/* Main content */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Left: member task section */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              담당자별 태스크{" "}
              <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>({tasks.length})</span>
            </h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!isDone(project.status) && (
              <button
                onClick={() => setTaskModal(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "6px 14px", borderRadius: 8, fontSize: 13,
                  fontWeight: 600, cursor: "pointer",
                  border: "none", background: "#1D9E75", color: "white",
                }}
              >
                + 태스크 추가
              </button>
            )}
            <div style={{ display: "flex", background: "white", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: "6px 12px", fontSize: 13, border: "none", cursor: "pointer",
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
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {unassignedTasks.length > 0 && (
              <MemberTaskCard
                name="미배정"
                email="unassigned"
                role="담당자 없음"
                color="#9CA3AF"
                tasks={unassignedTasks}
                filter={filter}
                onStatusChange={handleStatusChange}
                onAssigneeChange={handleAssigneeChange}
                members={members}
              />
            )}
            {memberGroups.map(({ member, raw, tasks: mt, color }) => (
              <MemberTaskCard
                key={member.userId}
                name={member.name}
                email={raw.email}
                role={member.role}
                color={color}
                tasks={mt}
                filter={filter}
                onStatusChange={handleStatusChange}
                onAssigneeChange={handleAssigneeChange}
                members={members}
              />
            ))}
          </div>

          {memberGroups.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-tertiary)", fontSize: 14 }}>
              팀원이 없습니다
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 팀원 목록 */}
          <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>팀원</span>
              <span style={{ fontSize: 12, color: "#1D9E75" }}>{members.length}명</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {members.map((m, i) => (
                <div key={m.userId} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: MEMBER_COLORS[i % MEMBER_COLORS.length],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: 700, fontSize: 12,
                  }}>
                    {m.name.slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{m.department}</div>
                  </div>
                  <span style={{ fontSize: 11, color: m.role === 'LEADER' ? '#1D9E75' : 'var(--text-tertiary)', fontWeight: 600 }}>
                    {m.role === 'LEADER' ? '리더' : '멤버'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 프로젝트 관리 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {!isDone(project.status) && (
              <button
                onClick={() => setCompleteConfirm(true)}
                style={{ width: "100%", padding: "9px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "#1D9E75", color: "white" }}
              >
                프로젝트 완료
              </button>
            )}
            {isDone(project.status) && (
              <div style={{ textAlign: "center", padding: "8px 0", fontSize: 13, fontWeight: 600, color: "#1D9E75", background: "#E1F5EE", borderRadius: 8 }}>
                {project.status === 'evaluation_completed' ? '평가 완료' : '평가 대기'}
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={!isDone(project.status) ? openEditModal : undefined}
                disabled={isDone(project.status)}
                title={isDone(project.status) ? '완료된 프로젝트는 수정할 수 없습니다' : undefined}
                style={{ flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1px solid rgba(0,0,0,0.1)", background: isDone(project.status) ? "#F0EFE9" : "white", color: isDone(project.status) ? "#BDBDBD" : "#1A1A1A", cursor: isDone(project.status) ? "not-allowed" : "pointer" }}
              >
                수정
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                style={{ flex: 1, padding: "9px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "#FAECE7", color: "#D85A30" }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 태스크 추가 모달 ── */}
      {taskModal && (
        <div
          onClick={() => setTaskModal(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "white", borderRadius: 16, padding: "28px 32px",
              width: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>태스크 추가</h2>
            <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  태스크 이름 <span style={{ color: "#E85D5D" }}>*</span>
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="예) 로그인 API 연결"
                  maxLength={200}
                  style={modalInputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  설명
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="태스크에 대해 간단히 설명해주세요"
                  rows={3}
                  style={{ ...modalInputStyle, resize: "none", lineHeight: 1.6 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  담당자
                </label>
                <select
                  value={taskForm.assigneeId}
                  onChange={e => setTaskForm(p => ({ ...p, assigneeId: e.target.value }))}
                  style={{ ...modalInputStyle, cursor: "pointer" }}
                >
                  <option value="">미배정</option>
                  {members.map(m => (
                    <option key={m.userId} value={m.userId}>{m.name}</option>
                  ))}
                </select>
              </div>
              {taskFormError && (
                <div style={{ fontSize: 13, color: "#E85D5D", padding: "8px 12px", background: "#FAECE7", borderRadius: 8 }}>
                  {taskFormError}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={taskCreating}
                  style={{
                    flex: 1, padding: "11px 0",
                    background: taskCreating ? "#aaa" : "#1D9E75",
                    color: "white", border: "none", borderRadius: 8,
                    fontSize: 14, fontWeight: 600, cursor: taskCreating ? "not-allowed" : "pointer",
                  }}
                >
                  {taskCreating ? "추가 중..." : "태스크 추가"}
                </button>
                <button
                  type="button"
                  onClick={() => { setTaskModal(false); setTaskFormError(""); setTaskForm({ title: "", description: "", assigneeId: "" }); }}
                  style={{
                    padding: "11px 20px", background: "#F0EFE9", color: "#555",
                    border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── 프로젝트 수정 모달 ── */}
      {editModal && (
        <div
          onClick={() => setEditModal(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 16, padding: "28px 32px", width: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>프로젝트 수정</h2>
            <form onSubmit={handleEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  프로젝트 이름 <span style={{ color: "#E85D5D" }}>*</span>
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                  maxLength={100}
                  style={modalInputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  설명
                </label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  style={{ ...modalInputStyle, resize: "none", lineHeight: 1.6 }}
                />
              </div>
              {editError && (
                <div style={{ fontSize: 13, color: "#E85D5D", padding: "8px 12px", background: "#FAECE7", borderRadius: 8 }}>
                  {editError}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={editSaving}
                  style={{ flex: 1, padding: "11px 0", background: editSaving ? "#aaa" : "#1D9E75", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: editSaving ? "not-allowed" : "pointer" }}
                >
                  {editSaving ? "저장 중..." : "저장"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  style={{ padding: "11px 20px", background: "#F0EFE9", color: "#555", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 프로젝트 삭제 확인 ── */}
      {deleteConfirm && (
        <div
          onClick={() => !deleting && setDeleteConfirm(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 16, padding: "28px 32px", width: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>프로젝트 삭제</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>
              <b>{project.title}</b> 프로젝트를 삭제하면 모든 태스크와 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ flex: 1, padding: "11px 0", background: deleting ? "#aaa" : "#D85A30", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer" }}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={deleting}
                style={{ padding: "11px 20px", background: "#F0EFE9", color: "#555", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 완료 후 동료 평가 안내 ── */}
      {evalPrompt && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
        >
          <div style={{ background: "white", borderRadius: 20, padding: "32px 32px 28px", width: 400, boxShadow: "0 12px 40px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.4px" }}>프로젝트가 완료됐어요!</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 24 }}>
              함께한 팀원들에게 동료 평가를 남겨보세요.<br />
              솔직한 피드백이 서로의 성장에 도움이 돼요.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => { setEvalPrompt(false); navigate("/review"); }}
                style={{
                  width: "100%", padding: "13px 0",
                  background: "#1D9E75", color: "white",
                  border: "none", borderRadius: 10,
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                }}
              >
                동료 평가 하러 가기 →
              </button>
              <button
                onClick={() => setEvalPrompt(false)}
                style={{
                  width: "100%", padding: "11px 0",
                  background: "#F0EFE9", color: "var(--text-secondary)",
                  border: "none", borderRadius: 10,
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                나중에 할게요
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 프로젝트 완료 확인 ── */}
      {completeConfirm && (
        <div
          onClick={() => !completing && setCompleteConfirm(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 16, padding: "28px 32px", width: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>프로젝트 완료</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
              <b>{project.title}</b> 프로젝트를 완료 처리하시겠습니까? 완료 후에는 동료 평가를 작성할 수 있습니다.
            </p>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", background: "#FFF8F0", border: "1px solid #F5D9B8", borderRadius: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
              <span style={{ fontSize: 13, color: "#B45309", lineHeight: 1.6 }}>
                완료 처리 후에는 프로젝트 이름과 설명을 <b>수정할 수 없습니다.</b>
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleComplete}
                disabled={completing}
                style={{ flex: 1, padding: "11px 0", background: completing ? "#aaa" : "#1D9E75", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: completing ? "not-allowed" : "pointer" }}
              >
                {completing ? "처리 중..." : "완료 처리"}
              </button>
              <button
                onClick={() => setCompleteConfirm(false)}
                disabled={completing}
                style={{ padding: "11px 20px", background: "#F0EFE9", color: "#555", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const modalInputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 13px",
  borderRadius: 8, border: "1px solid #E0E0E0",
  background: "#FAFAFA", fontSize: 14,
  color: "#1A1A1A", outline: "none", fontFamily: "inherit",
};

function StatCard({ label, value, unit, sub, subColor }: {
  label: string; value: number | string; unit: string; sub: string; subColor?: string;
}) {
  return (
    <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(0,0,0,0.08)" }}>
      <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>
        {value}
        <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text-tertiary)" }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12, color: subColor ?? "#A0A0A0", marginTop: 6 }}>{sub}</div>
    </div>
  );
}
