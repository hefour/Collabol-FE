import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { projectsApi, toProject } from "../api/projects";
import { evaluationsApi, type EvaluationResponse } from "../api/evaluations";
import { teamApi, type TeamMemberResponse } from "../api/team";
import { useAuth } from "../contexts/AuthContext";
import type { Project } from "../types";

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

function formatYearMonth(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatSubmitDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} 제출`;
}

const AVATAR_COLORS = [
  "#1D9E75", "#6366F1", "#EC4899", "#F97316",
  "#0EA5E9", "#8B5CF6", "#F59E0B", "#10B981",
];

function avatarColor(id: string | number) {
  const s = String(id);
  return AVATAR_COLORS[s.charCodeAt(s.length - 1) % AVATAR_COLORS.length];
}

function AvatarIcon({ id, name, size = 40 }: { id: string | number; name: string; size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: avatarColor(id), color: "#fff",
        fontWeight: 800, fontSize: size * 0.38,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, letterSpacing: "-0.5px",
      }}
    >
      {name[0]}
    </div>
  );
}

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface PendingItem {
  projectId: string;
  projectTitle: string;
  projectStart: string;
  revieweeId: string;
  revieweeName: string;
  revieweeEmail: string;
}

// ─── ReviewPage ───────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projectFilter, setProjectFilter] = useState("all");
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [projects, setProjects]           = useState<Project[]>([]);
  const [pendingItems, setPendingItems]   = useState<PendingItem[]>([]);
  const [completedEvals, setCompletedEvals] = useState<EvaluationResponse[]>([]);

  const pendingRef   = useRef<HTMLDivElement>(null);
  const completedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const projectList = await projectsApi.list();
        const mapped = projectList.map(toProject);
        setProjects(mapped);

        const completedProjects = mapped.filter(p => p.status === "completed" || p.status === "evaluation_completed");
        if (completedProjects.length === 0) return;

        const projectData = await Promise.all(
          completedProjects.map(p => Promise.all([
            teamApi.members(Number(p.id)),
            evaluationsApi.list(Number(p.id)),
          ]))
        );

        const pending: PendingItem[] = [];
        const completed: EvaluationResponse[] = [];

        projectData.forEach(([members, myEvals], i) => {
          const project = completedProjects[i];
          const evaluatedIds = new Set(myEvals.map(e => e.reviewee.userId));

          (members as TeamMemberResponse[]).forEach(m => {
            if (m.email !== user?.email && !evaluatedIds.has(m.userId)) {
              pending.push({
                projectId: project.id,
                projectTitle: project.title,
                projectStart: project.startDate,
                revieweeId: String(m.userId),
                revieweeName: m.name,
                revieweeEmail: m.email,
              });
            }
          });

          completed.push(...myEvals);
        });

        setPendingItems(pending);
        setCompletedEvals(
          completed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.email]);

  const pendingList = useMemo(
    () => pendingItems.filter(p => projectFilter === "all" || p.projectId === projectFilter),
    [pendingItems, projectFilter]
  );

  const completedList = useMemo(
    () => completedEvals.filter(e => projectFilter === "all" || String(e.projectId) === projectFilter),
    [completedEvals, projectFilter]
  );

  const displayedCompleted = showAllCompleted ? completedList : completedList.slice(0, 3);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return <div style={{ padding: 24, color: "var(--text-tertiary)" }}>불러오는 중...</div>;

  return (
    <div style={{ padding: '20px 16px' }} className="md-page-padding">
      <div>

        {/* ── 페이지 헤더 ── */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>동료 평가</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            함께한 팀원에게 솔직한 피드백을 남기고, 협업 프로필을 함께 만들어가요
          </p>
        </div>

        {/* ── 알림 배너 ── */}
        {pendingItems.length > 0 && (
          <div
            style={{
              background: "var(--amber-light)",
              border: "1px solid #f5d48a",
              borderRadius: "var(--radius-lg)",
              padding: "16px 20px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "var(--amber)", color: "#fff",
                  fontSize: 18, fontWeight: 900,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                !
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 15, color: "var(--amber-dark)", marginBottom: 4 }}>
                  대기 중인 동료 평가 {pendingItems.length}건이 있어요
                </p>
                <p style={{ fontSize: 13, color: "#7c5c0a", lineHeight: 1.5 }}>
                  완료된 프로젝트 팀원들에게 솔직한 피드백을 남겨주세요. 평가는 익명으로 처리됩니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => scrollTo(pendingRef)}
              style={{
                padding: "10px 18px", borderRadius: "var(--radius-md)",
                background: "var(--green)", color: "#fff",
                fontWeight: 700, fontSize: 14, border: "none",
                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              지금 평가하기 →
            </button>
          </div>
        )}

        {/* ── 탭 카운트 + 프로젝트 필터 ── */}
        <div
          style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28, gap: 12, flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex", gap: 4,
              background: "var(--surface2)", padding: 4,
              borderRadius: "var(--radius-md)",
            }}
          >
            {[
              { label: "대기",  count: pendingItems.length,   ref: pendingRef },
              { label: "완료",  count: completedEvals.length, ref: completedRef },
            ].map(({ label, count, ref }) => (
              <button
                key={label}
                onClick={() => scrollTo(ref)}
                style={{
                  padding: "7px 14px", borderRadius: "var(--radius-sm)",
                  border: "none", cursor: "pointer",
                  fontWeight: 700, fontSize: 14,
                  display: "flex", alignItems: "center", gap: 6,
                  background: "transparent", color: "var(--text-secondary)",
                }}
              >
                {label}
                <span
                  style={{
                    background: count > 0 ? "var(--green)" : "#d1d5db",
                    color: "#fff", borderRadius: 999,
                    fontSize: 11, fontWeight: 700,
                    padding: "1px 7px", minWidth: 20, textAlign: "center",
                  }}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border2)",
              borderRadius: "var(--radius-md)",
              background: "var(--surface)",
              color: "var(--text-primary)",
              fontSize: 13, cursor: "pointer",
            }}
          >
            <option value="all">전체 프로젝트</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        {/* ── 대기 중인 평가 섹션 ── */}
        <div ref={pendingRef} style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, color: "var(--text-primary)" }}>
            대기 중인 평가{" "}
            <span style={{ fontWeight: 700, color: "var(--text-secondary)", fontSize: 14 }}>
              {pendingList.length}
            </span>
          </p>

          {pendingList.length === 0 ? (
            <div
              style={{
                background: "var(--surface)", borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border)", padding: "40px 24px",
                textAlign: "center", color: "var(--text-tertiary)", fontSize: 14,
              }}
            >
              대기 중인 평가가 없어요
            </div>
          ) : (
            <div className="card-grid">
              {pendingList.map(item => (
                <div
                  key={`${item.projectId}-${item.revieweeId}`}
                  style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-xl)", padding: "20px 22px",
                    display: "flex", flexDirection: "column", gap: 14,
                  }}
                >
                  {/* 프로젝트명 */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>
                      {item.projectTitle}
                    </span>
                    <span
                      style={{
                        fontSize: 12, fontWeight: 700, padding: "3px 10px",
                        borderRadius: 999, background: "var(--green-light)", color: "var(--green-mid)",
                      }}
                    >
                      평가 대기
                    </span>
                  </div>

                  {/* 대상자 */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <AvatarIcon id={item.revieweeId} name={item.revieweeName} size={46} />
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{item.revieweeName}</p>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                        @{item.revieweeEmail.split("@")[0]}
                      </p>
                    </div>
                  </div>

                  {/* 함께한 기간 */}
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    프로젝트 시작: {formatYearMonth(item.projectStart)}
                  </p>

                  {/* CTA */}
                  <button
                    onClick={() => navigate(`/evaluate/${item.projectId}/${item.revieweeId}`)}
                    style={{
                      marginTop: 2, padding: "11px 0",
                      background: "var(--text-primary)", color: "#fff",
                      border: "none", borderRadius: "var(--radius-md)",
                      fontWeight: 700, fontSize: 14, cursor: "pointer",
                    }}
                  >
                    평가 시작 →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 완료한 평가 섹션 ── */}
        <div ref={completedRef}>
          <div
            style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 16,
            }}
          >
            <p style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)" }}>
              완료한 평가{" "}
              <span style={{ fontWeight: 700, color: "var(--text-secondary)", fontSize: 14 }}>
                {completedList.length}
              </span>
            </p>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>최근순 ▾</span>
          </div>

          {completedList.length === 0 ? (
            <div
              style={{
                background: "var(--surface)", borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border)", padding: "40px 24px",
                textAlign: "center", color: "var(--text-tertiary)", fontSize: 14,
              }}
            >
              완료한 평가가 없어요
            </div>
          ) : (
            <>
              <div
                style={{
                  background: "var(--surface)", borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--border)", overflow: "hidden",
                }}
              >
                {displayedCompleted.map((ev, idx) => {
                  const scores = [
                    ev.presentationScore, ev.communicationScore,
                    ev.collaborationScore, ev.sincerityScore, ev.planningScore,
                  ];
                  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

                  const skillLabels = ["발표력", "커뮤니케이션", "협업태도", "성실성", "기획력"];
                  const topTags = scores
                    .map((s, i) => ({ tag: skillLabels[i], score: s }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 2)
                    .map(t => t.tag);

                  return (
                    <div
                      key={ev.id}
                      style={{
                        padding: "16px 22px",
                        borderBottom: idx < displayedCompleted.length - 1 ? "1px solid var(--border)" : "none",
                        display: "flex", alignItems: "center", gap: 14,
                      }}
                    >
                      <AvatarIcon id={ev.reviewee.userId} name={ev.reviewee.name} size={40} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
                          {ev.reviewee.name}
                        </p>
                        {ev.comment && (
                          <p
                            style={{
                              fontSize: 13, color: "var(--text-secondary)",
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                          >
                            "{ev.comment}"
                          </p>
                        )}
                        <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                          {topTags.map(tag => (
                            <span
                              key={tag}
                              style={{
                                fontSize: 11, padding: "2px 8px", borderRadius: 999,
                                background: "var(--surface2)", color: "var(--text-secondary)", fontWeight: 600,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                        <span
                          style={{
                            padding: "4px 10px", borderRadius: 999,
                            fontSize: 13, fontWeight: 800,
                            background: "#fff9c2", color: "#b45309", whiteSpace: "nowrap",
                          }}
                        >
                          ★ {avg.toFixed(1)}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
                          {formatSubmitDate(ev.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {completedList.length > 3 && !showAllCompleted && (
                <button
                  onClick={() => setShowAllCompleted(true)}
                  style={{
                    width: "100%", marginTop: 12, padding: "13px 0",
                    background: "transparent", border: "none",
                    color: "var(--text-secondary)", fontSize: 14,
                    fontWeight: 700, cursor: "pointer",
                  }}
                >
                  + 이전 평가 {completedList.length - 3}건 더 보기
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
