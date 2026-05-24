import { useState, useEffect } from 'react';
import { projectsApi, toProject } from '../api/projects';
import { evaluationsApi, toReview } from '../api/evaluations';
import { tasksApi, toTask } from '../api/tasks';
import { teamApi, toProjectMember } from '../api/team';
import { useAuth } from '../contexts/AuthContext';
import type { Project, Task, ProjectStatus, Review } from '../types';
import { ProjectCard } from '../components/ui/ProjectCard';

type Filter = 'all' | 'in_progress' | 'completed';

const TAB_LABELS: Record<Filter, string> = {
  all: '전체',
  in_progress: '진행 중',
  completed: '완료',
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasksMap, setTasksMap] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) { setJoinError('초대코드를 입력해주세요.'); return; }
    setJoining(true);
    setJoinError('');
    try {
      await teamApi.join(joinCode.trim());
      const projectList = await projectsApi.list();
      const mapped = projectList.map(toProject);
      const [taskResults, memberResults] = await Promise.all([
        Promise.all(mapped.map(p =>
          tasksApi.list(Number(p.id))
            .then(t => ({ id: p.id, tasks: t.map(toTask) }))
            .catch(() => ({ id: p.id, tasks: [] as Task[] }))
        )),
        Promise.all(mapped.map(p =>
          teamApi.members(Number(p.id))
            .then(m => ({ id: p.id, members: m.map(toProjectMember) }))
            .catch(() => ({ id: p.id, members: [] }))
        )),
      ]);
      const tm: Record<string, Task[]> = {};
      taskResults.forEach(({ id, tasks }) => { tm[id] = tasks; });
      setTasksMap(tm);
      setProjects(mapped.map(p => ({
        ...p,
        members: memberResults.find(r => r.id === p.id)?.members ?? [],
      })));
      setJoinModalOpen(false);
      setJoinCode('');
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : '참가에 실패했습니다.');
    } finally {
      setJoining(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('프로젝트 이름을 입력해주세요.'); return; }
    setCreating(true);
    setFormError('');
    try {
      const res = await projectsApi.create(form.name.trim(), form.description.trim());
      setProjects(prev => [toProject(res), ...prev]);
      setTasksMap(prev => ({ ...prev, [String(res.id)]: [] }));
      setModalOpen(false);
      setForm({ name: '', description: '' });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '생성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const projectList = await projectsApi.list();
        const mapped = projectList.map(toProject);

        const [taskResults, memberResults] = await Promise.all([
          Promise.all(mapped.map(p =>
            tasksApi.list(Number(p.id))
              .then(t => ({ id: p.id, tasks: t.map(toTask) }))
              .catch(() => ({ id: p.id, tasks: [] as Task[] }))
          )),
          Promise.all(mapped.map(p =>
            teamApi.members(Number(p.id))
              .then(m => ({ id: p.id, members: m.map(toProjectMember), count: m.length }))
              .catch(() => ({ id: p.id, members: [], count: 0 }))
          )),
        ]);

        const tm: Record<string, Task[]> = {};
        taskResults.forEach(({ id, tasks }) => { tm[id] = tasks; });
        setTasksMap(tm);

        // 완료된 프로젝트의 평가 목록 로드
        const completedIds = mapped
          .filter(p => p.status === 'completed' || p.status === 'evaluation_completed')
          .map(p => p.id);

        const evalResults = await Promise.all(
          completedIds.map(id =>
            evaluationsApi.list(Number(id))
              .then(evals => ({ id, evals }))
              .catch(() => ({ id, evals: [] }))
          )
        );

        const rm: Record<string, Review[]> = {};
        // 평가가 전부 완료된 프로젝트 id 집합
        const evalCompletedSet = new Set<string>();

        evalResults.forEach(({ id, evals }) => {
          rm[id] = evals.map(toReview);
          const memberCount = memberResults.find(r => r.id === id)?.count ?? 0;
          const expected = memberCount * (memberCount - 1);
          // expected > 0 이고 실제 제출 수가 충족되면 평가 완료로 처리
          if (expected > 0 && evals.length >= expected) {
            evalCompletedSet.add(id);
          }
        });

        setReviewsMap(rm);
        setProjects(mapped.map(p => ({
          ...p,
          // 평가 완료 조건을 만족하면 프론트에서 status 오버라이드
          status: evalCompletedSet.has(p.id)
            ? ('evaluation_completed' as ProjectStatus)
            : p.status,
          members: memberResults.find(r => r.id === p.id)?.members ?? [],
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : '불러오기 실패');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const inProgressProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects  = projects.filter(p => p.status === 'completed' || p.status === 'evaluation_completed');

  const filtered =
    filter === 'all'         ? projects :
    filter === 'in_progress' ? inProgressProjects :
                               completedProjects;

  const tabCounts: Record<Filter, number> = {
    all:         projects.length,
    in_progress: inProgressProjects.length,
    completed:   completedProjects.length,
  };

  return (
    <div style={{ padding: '20px 16px' }} className="md-page-padding">

      {/* ── 헤더 ── */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>프로젝트</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            참여 중인 프로젝트와 종료된 프로젝트를 한곳에서 관리해요
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setJoinModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--surface)', color: 'var(--text-secondary)',
              border: '1px solid var(--border2)', borderRadius: 'var(--radius-md)',
              padding: '10px 18px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            🔗 코드로 참가
          </button>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--green)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-md)',
              padding: '10px 18px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            + 새 프로젝트
          </button>
        </div>
      </div>

      {/* ── 통계 바 ── */}
      <div className="stats-grid">
        <StatCard
          label="전체 프로젝트"
          value={String(projects.length)}
          sub={`진행 중 ${inProgressProjects.length} · 완료 ${completedProjects.length}`}
        />
        <StatCard label="진행 중" value={String(inProgressProjects.length)} sub="프로젝트" />
        <StatCard label="완료" value={String(completedProjects.length)} sub="프로젝트" />
      </div>

      {/* ── 탭 필터 ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'in_progress', 'completed'] as Filter[]).map(f => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: active ? '1px solid var(--border2)' : '1px solid transparent',
                  background: active ? 'var(--surface)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.12s',
                }}
              >
                {TAB_LABELS[f]}&nbsp;
                <span style={{ fontSize: 11, fontWeight: 500, color: active ? 'var(--green)' : 'var(--text-tertiary)' }}>
                  {tabCounts[f]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 코드로 참가 모달 ── */}
      {joinModalOpen && (
        <div
          onClick={() => { setJoinModalOpen(false); setJoinCode(''); setJoinError(''); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>코드로 프로젝트 참가</h2>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 20, lineHeight: 1.6 }}>
              팀장에게 받은 초대코드를 입력하세요
            </p>
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="text"
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value); setJoinError(''); }}
                placeholder="초대코드 입력"
                autoFocus
                style={inputStyle}
              />
              {joinError && (
                <div style={{ fontSize: 13, color: 'var(--coral)', padding: '8px 12px', background: 'var(--coral-light)', borderRadius: 'var(--radius-sm)' }}>
                  {joinError}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={joining}
                  style={{
                    flex: 1, padding: '11px 0',
                    background: joining ? 'var(--text-tertiary)' : 'var(--green)',
                    color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
                    fontSize: 14, fontWeight: 600, cursor: joining ? 'not-allowed' : 'pointer',
                  }}
                >
                  {joining ? '참가 중...' : '참가하기'}
                </button>
                <button
                  type="button"
                  onClick={() => { setJoinModalOpen(false); setJoinCode(''); setJoinError(''); }}
                  style={{ padding: '11px 20px', background: 'var(--surface2)', color: 'var(--text-secondary)', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 새 프로젝트 모달 ── */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
              padding: '28px 32px', width: 440,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>새 프로젝트</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  프로젝트 이름 <span style={{ color: 'var(--coral)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="예) Collaball 플랫폼 개발"
                  maxLength={100}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  설명
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="프로젝트에 대해 간단히 설명해주세요"
                  maxLength={1000}
                  rows={3}
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                />
              </div>
              {formError && (
                <div style={{ fontSize: 13, color: 'var(--coral)', padding: '8px 12px', background: 'var(--coral-light)', borderRadius: 'var(--radius-sm)' }}>
                  {formError}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    flex: 1, padding: '11px 0',
                    background: creating ? 'var(--text-tertiary)' : 'var(--green)',
                    color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
                    fontSize: 14, fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {creating ? '생성 중...' : '프로젝트 만들기'}
                </button>
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setFormError(''); setForm({ name: '', description: '' }); }}
                  style={{
                    padding: '11px 20px',
                    background: 'var(--surface2)', color: 'var(--text-secondary)',
                    border: 'none', borderRadius: 'var(--radius-sm)',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 카드 그리드 ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)', fontSize: 14 }}>
          불러오는 중...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--coral)', fontSize: 14 }}>
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)', fontSize: 14 }}>
          프로젝트가 없습니다.
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              tasks={tasksMap[p.id] ?? []}
              reviews={reviewsMap[p.id] ?? []}
              activities={[]}
              allUsers={[]}
              currentUserId={user?.id ?? ''}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '16px 20px',
    }}>
      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6 }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{sub}</p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border2)',
  background: 'var(--bg)',
  fontSize: 14,
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'inherit',
};
