import { useMemo, useState } from "react";
import { currentUser, reviews, projects, tasks } from "../data/mockData";

const categories = [
  "발표력",
  "성실성",
  "커뮤니케이션",
  "기획력",
  "협업태도",
] as const;

export default function ProfilePage() {
  const user = currentUser;

  // ================= 자기소개 수정 기능 =================
  const [bio, setBio] = useState(user.bio);
  const [tempBio, setTempBio] = useState(user.bio);
  const [isEditingBio, setIsEditingBio] = useState(false);

  // 내가 받은 평가
  const myReviews = useMemo(() => {
    return reviews.filter((r) => r.revieweeId === user.id);
  }, []);

  // 평가자 수
  const reviewerCount = useMemo(() => {
    const set = new Set(myReviews.map((r) => r.reviewerId));
    return set.size;
  }, [myReviews]);

  // 스킬 평균
  const skillAvg = useMemo(() => {
    const result: Record<string, number> = {};

    categories.forEach((c) => {
      const sum = myReviews.reduce((acc, r) => {
        const found = r.skillRatings.find((s) => s.tag === c);
        return acc + (found?.score || 0);
      }, 0);

      result[c] = myReviews.length ? sum / myReviews.length : 0;
    });

    return result;
  }, [myReviews]);

  // 총 평균
  const totalScore = useMemo(() => {
    if (!myReviews.length) return 0;

    const sum = myReviews.reduce((acc, r) => {
      const avg =
        r.skillRatings.reduce((a, b) => a + b.score, 0) /
        r.skillRatings.length;

      return acc + avg;
    }, 0);

    return sum / myReviews.length;
  }, [myReviews]);

  // 참여 프로젝트
  const myProjects = useMemo(() => {
    return projects.filter((p) =>
      p.members.some((m) => m.userId === user.id)
    );
  }, []);

  // 태스크 완료율
  const myTasks = useMemo(() => {
    return tasks.filter((t) => t.assigneeId === user.id);
  }, []);

  const taskRate = useMemo(() => {
    if (!myTasks.length) return 0;
    const done = myTasks.filter((t) => t.status === "done").length;
    return Math.round((done / myTasks.length) * 100);
  }, [myTasks]);

  // 타임라인
  const timeline = useMemo(() => {
    const events = [
      ...myReviews.map((r) => ({
        date: r.createdAt,
        text: "새 평가 수신",
      })),
      ...myProjects.map((p) => ({
        date: p.createdAt,
        text: `프로젝트 참여: ${p.title}`,
      })),
      ...myTasks.map((t) => ({
        date: t.createdAt,
        text: `태스크 생성: ${t.title}`,
      })),
    ];

    return events.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [myReviews, myProjects, myTasks]);

  // ✅ 공유 링크 (SharePage로 이동)
  const shareUrl = `${window.location.origin}/profile/${user.id}/share`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("프로필 링크가 복사되었습니다!");
    } catch (e) {
      alert("복사 실패");
    }
  };

  return (
    <div style={{ padding: 24, background: "#f8fafc", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>프로필</h1>

      {/* ================= 사용자 정보 ================= */}
      <div
        style={{
          marginTop: 16,
          padding: 20,
          background: "white",
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{user.name}</h2>
        <p>{user.department}</p>

        {/* ================= 자기소개 ================= */}
        <p style={{ marginTop: 8 }}>{bio}</p>

        {isEditingBio ? (
          <div
            style={{
              marginTop: 10,
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fafafa",
            }}
          >
            <p style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
              ✏️ 자기소개 수정 중
            </p>

            <textarea
              value={tempBio}
              onChange={(e) => setTempBio(e.target.value)}
              style={{
                width: "100%",
                height: 80,
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
                resize: "none",
              }}
            />

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={() => {
                  setBio(tempBio);
                  setIsEditingBio(false);
                }}
              >
                저장
              </button>

              <button
                onClick={() => {
                  setTempBio(bio);
                  setIsEditingBio(false);
                }}
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setTempBio(bio);
              setIsEditingBio(true);
            }}
            style={{
              marginTop: 8,
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            자기소개 수정
          </button>
        )}
      </div>

      {/* ================= 스킬 ================= */}
      <div style={{ marginTop: 20, background: "white", padding: 20, borderRadius: 16 }}>
        <h3>스킬 평균</h3>

        {categories.map((c) => (
          <div key={c} style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{c}</span>
              <span>{skillAvg[c].toFixed(1)} / 5</span>
            </div>

            <div style={{ height: 8, background: "#eee", borderRadius: 999 }}>
              <div
                style={{
                  width: `${(skillAvg[c] / 5) * 100}%`,
                  height: "100%",
                  background: "#22c55e",
                }}
              />
            </div>
          </div>
        ))}

        <h3 style={{ marginTop: 16 }}>
          총 평균: ⭐ {totalScore.toFixed(1)}
        </h3>
      </div>

      {/* ================= 통계 ================= */}
      <div style={{ marginTop: 20, background: "white", padding: 20, borderRadius: 16 }}>
        <h3>활동 통계</h3>
        <p>받은 평가: {myReviews.length}건</p>
        <p>평가자 수: {reviewerCount}명</p>
        <p>참여 프로젝트: {myProjects.length}개</p>
        <p>태스크 완료율: {taskRate}%</p>
      </div>

      {/* ================= 프로젝트 ================= */}
      <div style={{ marginTop: 20, background: "white", padding: 20, borderRadius: 16 }}>
        <h3>참여 프로젝트</h3>
        {myProjects.map((p) => (
          <p key={p.id}>• {p.title}</p>
        ))}
      </div>

      {/* ================= 타임라인 ================= */}
      <div style={{ marginTop: 20, background: "white", padding: 20, borderRadius: 16 }}>
        <h3>활동 타임라인</h3>
        {timeline.slice(0, 8).map((t, i) => (
          <p key={i}>
            {new Date(t.date).toLocaleDateString()} - {t.text}
          </p>
        ))}
      </div>

      {/* ================= 공유 ================= */}
      <button
        onClick={handleShare}
        style={{
          marginTop: 20,
          padding: "10px 16px",
          background: "black",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        🔗 프로필 링크 공유
      </button>
    </div>
  );
}
