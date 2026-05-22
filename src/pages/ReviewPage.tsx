import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  reviewRequests,
  reviews,
  projects,
  users,
  currentUser,
} from "../data/mockData";
import type { Project } from "../types";

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-05-21");

function getDDay(dueDate: string) {
  const due = new Date(dueDate);
  return Math.ceil((due.getTime() - TODAY.getTime()) / 86_400_000);
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function formatYearMonth(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatSubmitDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} 제출`;
}

function timeAgo(iso: string) {
  const diffMs = TODAY.getTime() - new Date(iso).getTime();
  const h = Math.floor(diffMs / 3_600_000);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

function formatPeriod(project: Project) {
  const start = project.startDate;
  const end = project.endDate ?? project.dueDate;
  const months = end
    ? Math.max(
        1,
        (new Date(end).getFullYear() - new Date(start).getFullYear()) * 12 +
          new Date(end).getMonth() -
          new Date(start).getMonth()
      )
    : null;
  const endLabel = project.endDate
    ? formatYearMonth(project.endDate)
    : "진행 중";
  return `${formatYearMonth(start)} - ${endLabel}${months ? ` (${months}개월)` : ""}`;
}

const AVATAR_COLORS = [
  "#1D9E75",
  "#6366F1",
  "#EC4899",
  "#F97316",
  "#0EA5E9",
  "#8B5CF6",
  "#F59E0B",
  "#10B981",
];

function avatarColor(userId: string) {
  return AVATAR_COLORS[userId.charCodeAt(userId.length - 1) % AVATAR_COLORS.length];
}

// ─── Avatar 컴포넌트 ──────────────────────────────────────────────────────────

function Avatar({
  userId,
  name,
  size = 40,
}: {
  userId: string;
  name: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: avatarColor(userId),
        color: "#fff",
        fontWeight: 800,
        fontSize: size * 0.38,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        letterSpacing: "-0.5px",
      }}
    >
      {name[0]}
    </div>
  );
}

// ─── ReviewPage ───────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const navigate = useNavigate();
  const [projectFilter, setProjectFilter] = useState("all");
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  const pendingRef = useRef<HTMLDivElement>(null);
  const inProgressRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef<HTMLDivElement>(null);

  const getUserById = (id: string) =>
    id === currentUser.id ? (currentUser as typeof users[0]) : users.find((u) => u.id === id);
  const getProjectById = (id: string) => projects.find((p) => p.id === id);

  // 필터 적용
  const pendingList = useMemo(
    () =>
      reviewRequests.filter(
        (r) =>
          r.status === "pending" &&
          (projectFilter === "all" || r.projectId === projectFilter)
      ),
    [projectFilter]
  );

  const inProgressList = useMemo(
    () =>
      reviewRequests.filter(
        (r) =>
          r.status === "in_progress" &&
          (projectFilter === "all" || r.projectId === projectFilter)
      ),
    [projectFilter]
  );

  const completedList = useMemo(
    () =>
      reviews
        .filter(
          (r) =>
            r.reviewerId === currentUser.id &&
            (projectFilter === "all" || r.projectId === projectFilter)
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [projectFilter]
  );

  const displayedCompleted = showAllCompleted
    ? completedList
    : completedList.slice(0, 3);

  // 가장 마감이 가까운 대기 항목
  const nearestPending = [...reviewRequests.filter((r) => r.status === "pending")].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )[0];

  const totalPending = reviewRequests.filter((r) => r.status === "pending").length;
  const totalInProgress = reviewRequests.filter((r) => r.status === "in_progress").length;
  const totalCompleted = reviews.filter((r) => r.reviewerId === currentUser.id).length;

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ padding: '20px 16px' }} className="md-page-padding">
      <div>

        {/* ── 페이지 헤더 ── */}
        <div style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            동료 평가
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            함께한 팀원에게 솔직한 피드백을 남기고, 협업 프로필을 함께
            만들어가요
          </p>
        </div>

        {/* ── 알림 배너 ── */}
        {totalPending > 0 && nearestPending && (
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
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--amber)",
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                !
              </div>
              <div>
                <p
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: "var(--amber-dark)",
                    marginBottom: 4,
                  }}
                >
                  평가 마감 알림! 대기 중인 평가 {totalPending}건이 있어요
                </p>
                <p style={{ fontSize: 13, color: "#7c5c0a", lineHeight: 1.5 }}>
                  {getProjectById(nearestPending.projectId)?.title} 동료 평가가{" "}
                  {formatShortDate(nearestPending.dueDate)}에 마감돼요. 평가는
                  익명으로 처리됩니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => scrollTo(pendingRef)}
              style={{
                padding: "10px 18px",
                borderRadius: "var(--radius-md)",
                background: "var(--green)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              지금 평가하기 →
            </button>
          </div>
        )}

        {/* ── 탭 카운트 + 프로젝트 필터 ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "var(--surface2)",
              padding: 4,
              borderRadius: "var(--radius-md)",
            }}
          >
            {[
              { label: "대기", count: totalPending, ref: pendingRef },
              { label: "진행 중", count: totalInProgress, ref: inProgressRef },
              { label: "완료", count: totalCompleted, ref: completedRef },
            ].map(({ label, count, ref }) => (
              <button
                key={label}
                onClick={() => scrollTo(ref)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  color: "var(--text-secondary)",
                }}
              >
                {label}
                <span
                  style={{
                    background: count > 0 ? "var(--green)" : "#d1d5db",
                    color: "#fff",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 7px",
                    minWidth: 20,
                    textAlign: "center",
                  }}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--border2)",
              borderRadius: "var(--radius-md)",
              background: "var(--surface)",
              color: "var(--text-primary)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <option value="all">전체 프로젝트</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* ── 대기 중인 평가 섹션 ── */}
        <div ref={pendingRef} style={{ marginBottom: 36 }}>
          <p
            style={{
              fontSize: 15,
              fontWeight: 800,
              marginBottom: 16,
              color: "var(--text-primary)",
            }}
          >
            대기 중인 평가{" "}
            <span
              style={{
                fontWeight: 700,
                color: "var(--text-secondary)",
                fontSize: 14,
              }}
            >
              {pendingList.length}
            </span>
          </p>

          {pendingList.length === 0 ? (
            <div
              style={{
                background: "var(--surface)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border)",
                padding: "40px 24px",
                textAlign: "center",
                color: "var(--text-tertiary)",
                fontSize: 14,
              }}
            >
              대기 중인 평가가 없어요
            </div>
          ) : (
            <div className="card-grid">
              {pendingList.map((req) => {
                const reviewee = getUserById(req.revieweeId);
                const project = getProjectById(req.projectId);
                if (!reviewee || !project) return null;
                const dDay = getDDay(req.dueDate);

                return (
                  <div
                    key={req.id}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-xl)",
                      padding: "20px 22px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    {/* 프로젝트 + 마감 */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: "var(--text-secondary)",
                          fontWeight: 600,
                        }}
                      >
                        {project.title}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 999,
                          background:
                            dDay <= 7 ? "var(--green-light)" : "var(--surface2)",
                          color:
                            dDay <= 7 ? "var(--green-mid)" : "var(--text-secondary)",
                        }}
                      >
                        D-{dDay} · {formatShortDate(req.dueDate)}
                      </span>
                    </div>

                    {/* 대상자 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <Avatar
                        userId={reviewee.id}
                        name={reviewee.name}
                        size={46}
                      />
                      <div>
                        <p
                          style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}
                        >
                          {reviewee.name}
                        </p>
                        <p
                          style={{ fontSize: 13, color: "var(--text-secondary)" }}
                        >
                          @{reviewee.email.split("@")[0]}
                        </p>
                      </div>
                    </div>

                    {/* 함께한 기간 */}
                    <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      함께한 기간: {formatPeriod(project)}
                    </p>

                    {/* 진행률 점 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-tertiary)",
                        }}
                      >
                        평가 진행률
                      </span>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: "50%",
                              background:
                                i < req.progress ? "var(--green)" : "transparent",
                              border:
                                "1.5px solid " +
                                (i < req.progress ? "var(--green)" : "#c8c8c8"),
                            }}
                          />
                        ))}
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {req.progress}/5 항목
                      </span>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => navigate(`/evaluate/${req.projectId}`)}
                      style={{
                        marginTop: 2,
                        padding: "11px 0",
                        background: "var(--text-primary)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      평가 시작 →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 진행 중 섹션 ── */}
        <div ref={inProgressRef} style={{ marginBottom: 36 }}>
          <p
            style={{
              fontSize: 15,
              fontWeight: 800,
              marginBottom: 16,
              color: "var(--text-primary)",
            }}
          >
            진행 중{" "}
            <span
              style={{
                fontWeight: 700,
                color: "var(--text-secondary)",
                fontSize: 14,
              }}
            >
              {inProgressList.length}
            </span>
          </p>

          {inProgressList.length === 0 ? (
            <div
              style={{
                background: "var(--surface)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border)",
                padding: "40px 24px",
                textAlign: "center",
                color: "var(--text-tertiary)",
                fontSize: 14,
              }}
            >
              진행 중인 평가가 없어요
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {inProgressList.map((req) => {
                const reviewee = getUserById(req.revieweeId);
                const project = getProjectById(req.projectId);
                if (!reviewee || !project) return null;

                const member = project.members.find(
                  (m) => m.userId === reviewee.id
                );

                return (
                  <div
                    key={req.id}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-xl)",
                      padding: "18px 22px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <Avatar
                      userId={reviewee.id}
                      name={reviewee.name}
                      size={46}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* 이름 + 임시저장 뱃지 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: 15 }}>
                          {reviewee.name}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: "var(--green-light)",
                            color: "var(--green-mid)",
                          }}
                        >
                          작성됨
                        </span>
                      </div>

                      {/* 역할 · 핸들 · 프로젝트 */}
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--text-secondary)",
                          marginBottom: 6,
                        }}
                      >
                        {member?.role ?? reviewee.skills[0]} · @
                        {reviewee.email.split("@")[0]} · {project.title}
                      </p>

                      {/* 마지막 저장 시간 */}
                      {req.lastSavedAt && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--text-tertiary)",
                            marginBottom: 10,
                          }}
                        >
                          마지막 작성: {timeAgo(req.lastSavedAt)} · 임시 저장됨
                        </p>
                      )}

                      {/* 진행률 바 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: 6,
                            background: "var(--surface2)",
                            borderRadius: 999,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${(req.progress / 5) * 100}%`,
                              height: "100%",
                              background:
                                "linear-gradient(90deg, var(--green), #4ade80)",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--green)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {req.progress} / 5
                        </span>
                      </div>

                      {/* 강점 태그 */}
                      {req.strengthTags && req.strengthTags.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            marginTop: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          {req.strengthTags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: 12,
                                padding: "3px 10px",
                                borderRadius: 999,
                                background: "var(--surface2)",
                                color: "var(--text-secondary)",
                                fontWeight: 600,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {req.strengthTags.length > 2 && (
                            <span
                              style={{
                                fontSize: 12,
                                padding: "3px 8px",
                                borderRadius: 999,
                                background: "var(--surface2)",
                                color: "var(--text-tertiary)",
                                fontWeight: 600,
                              }}
                            >
                              +{req.strengthTags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/evaluate/${req.projectId}`)}
                      style={{
                        padding: "10px 16px",
                        background: "var(--text-primary)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      이어서 작성 →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 완료한 평가 섹션 ── */}
        <div ref={completedRef}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              완료한 평가{" "}
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  fontSize: 14,
                }}
              >
                {completedList.length}
              </span>
            </p>
            <span
              style={{ fontSize: 13, color: "var(--text-secondary)" }}
            >
              최근순 ▾
            </span>
          </div>

          {completedList.length === 0 ? (
            <div
              style={{
                background: "var(--surface)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border)",
                padding: "40px 24px",
                textAlign: "center",
                color: "var(--text-tertiary)",
                fontSize: 14,
              }}
            >
              완료한 평가가 없어요
            </div>
          ) : (
            <>
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                }}
              >
                {displayedCompleted.map((review, idx) => {
                  const reviewee = getUserById(review.revieweeId);
                  if (!reviewee) return null;
                  const avg =
                    review.skillRatings.reduce((s, r) => s + r.score, 0) /
                    review.skillRatings.length;

                  // 상위 2개 스킬 태그
                  const topTags = [...review.skillRatings]
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 2)
                    .map((r) => r.tag);

                  return (
                    <div
                      key={review.id}
                      style={{
                        padding: "16px 22px",
                        borderBottom:
                          idx < displayedCompleted.length - 1
                            ? "1px solid var(--border)"
                            : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <Avatar
                        userId={reviewee.id}
                        name={reviewee.name}
                        size={40}
                      />

                      {/* 이름 + 코멘트 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            marginBottom: 3,
                          }}
                        >
                          {reviewee.name}
                        </p>
                        {review.comment && (
                          <p
                            style={{
                              fontSize: 13,
                              color: "var(--text-secondary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            "{review.comment}"
                          </p>
                        )}
                        <div
                          style={{
                            display: "flex",
                            gap: 5,
                            marginTop: 5,
                            flexWrap: "wrap",
                          }}
                        >
                          {topTags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: 11,
                                padding: "2px 8px",
                                borderRadius: 999,
                                background: "var(--surface2)",
                                color: "var(--text-secondary)",
                                fontWeight: 600,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 점수 + 날짜 + 상세 버튼 */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: 13,
                            fontWeight: 800,
                            background: "#fff9c2",
                            color: "#b45309",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ★ {avg.toFixed(1)}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--text-tertiary)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatSubmitDate(review.createdAt)}
                        </span>
                        <button
                          style={{
                            padding: "6px 14px",
                            background: "var(--surface2)",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          상세 →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {completedList.length > 3 && !showAllCompleted && (
                <button
                  onClick={() => setShowAllCompleted(true)}
                  style={{
                    width: "100%",
                    marginTop: 12,
                    padding: "13px 0",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-secondary)",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
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
