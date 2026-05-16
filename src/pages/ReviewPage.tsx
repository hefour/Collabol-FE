import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { reviews, projects, tasks } from "../data/mockData";

const categories = [
  "발표력",
  "성실성",
  "커뮤니케이션",
  "기획력",
  "협업태도",
] as const;

export default function ReviewPage() {
  const { project } = useParams();

  const filtered = useMemo(() => {
    return project
      ? reviews.filter((r) => r.projectId === project)
      : reviews;
  }, [project]);

  const anonMap = useMemo(() => {
    const map = new Map<string, string>();
    let count = 1;

    filtered.forEach((r) => {
      const key = r.reviewerId ?? r.id;
      if (!map.has(key)) {
        map.set(key, `익명 사용자 #${count++}`);
      }
    });

    return map;
  }, [filtered]);

  const getProjectName = (id: string) =>
    projects.find((p) => p.id === id)?.title || "알 수 없음";

  const collaborationScore = useMemo(() => {
    if (!filtered.length) return 0;

    const total = filtered.reduce((s, r) => {
      const avg =
        r.skillRatings.reduce((a, b) => a + b.score, 0) /
        r.skillRatings.length;
      return s + avg;
    }, 0);

    return total / filtered.length;
  }, [filtered]);

  const categoryAverages = useMemo(() => {
    return categories.reduce((acc, c) => {
      const sum = filtered.reduce((s, r) => {
        const item = r.skillRatings.find((x) => x.tag === c);
        return s + (item?.score || 0);
      }, 0);

      acc[c] = filtered.length ? sum / filtered.length : 0;
      return acc;
    }, {} as Record<(typeof categories)[number], number>);
  }, [filtered]);

  const projectCount = useMemo(() => {
    const set = new Set(filtered.map((r) => r.projectId));
    return set.size;
  }, [filtered]);

  const taskCompletionRate = useMemo(() => {
    const projectIds = project
      ? [project]
      : [...new Set(filtered.map((r) => r.projectId))];
    const relevant = tasks.filter((t) => projectIds.includes(t.projectId));
    if (!relevant.length) return 0;
    const done = relevant.filter((t) => t.status === "done").length;
    return Math.round((done / relevant.length) * 100);
  }, [project, filtered]);

  return (
    <div style={{ padding: 24, background: 'var(--bg)', minHeight: "100vh" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 20 }}>
        📊 동료 평가
      </h1>

      {/* ================= 협업 프로필 ================= */}
      <div
        style={{
          background: 'var(--surface)',
          padding: 28,
          borderRadius: 'var(--radius-xl)',
          boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
          border: "1px solid #eef2f7",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>
          협업 프로필
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 14,
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: "linear-gradient(135deg,#ecfdf5,#f0fdf4)",
              border: "1px solid #bbf7d0",
            }}
          >
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>평균 점수</p>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: 'var(--green)' }}>
              ⭐ {collaborationScore.toFixed(1)}
            </h3>
          </div>

          <div style={{ padding: 16, borderRadius: 16, background: "#fff", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>평가 수</p>
            <h3 style={{ fontSize: 22, fontWeight: 800 }}>
              {filtered.length}건
            </h3>
          </div>

          <div style={{ padding: 16, borderRadius: 16, background: "#fff", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>참여 프로젝트</p>
            <h3 style={{ fontSize: 22, fontWeight: 800 }}>
              {projectCount}개
            </h3>
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: taskCompletionRate >= 80 ? 'var(--blue-light)' : 'var(--surface)',
              border: "1px solid #e2e8f0",
            }}
          >
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>태스크 완료율</p>
            <h3
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: taskCompletionRate >= 80 ? "#2563eb" : "#0f172a",
              }}
            >
              {taskCompletionRate}%
            </h3>
          </div>
        </div>
      </div>

      {/* ================= 항목별 평균 ================= */}
      <div
        style={{
          marginTop: 24,
          background: 'var(--surface)',
          padding: 28,
          borderRadius: 'var(--radius-xl)',
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>
          항목별 평균
        </h2>

        {categories.map((c) => (
          <div key={c} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 600 }}>{c}</span>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>
                {categoryAverages[c].toFixed(1)} / 5
              </span>
            </div>

            <div
              style={{
                height: 8,
                background: "#eef2f7",
                borderRadius: 999,
                overflow: "hidden",
                marginTop: 6,
              }}
            >
              <div
                style={{
                  width: `${(categoryAverages[c] / 5) * 100}%`,
                  height: "100%",
                  background: "linear-gradient(90deg,#22c55e,#4ade80)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ================= 리뷰 카드 ================= */}
      {filtered.map((r) => {
        const key = r.reviewerId ?? r.id;
        const name = anonMap.get(key) ?? "익명 사용자";

        const avg =
          r.skillRatings.reduce((a, b) => a + b.score, 0) /
          r.skillRatings.length;

        return (
          <div
            key={r.id}
            style={{
              marginTop: 16,
              background: 'var(--surface)',
              padding: 22,
              borderRadius: 18,
              border: "1px solid #eef2f7",
              boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
            }}
          >
            <h3 style={{ fontWeight: 800 }}>{name}</h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              {getProjectName(r.projectId)}
            </p>

            <p style={{ marginTop: 6, fontWeight: 700 }}>
              ⭐ {avg.toFixed(1)}
            </p>

            <p style={{ marginTop: 10, color: "#334155", lineHeight: 1.5 }}>
              {r.comment}
            </p>
          </div>
        );
      })}
    </div>
  );
}
