import { useState, useEffect } from 'react';
import { projectsApi, toProject } from '../api/projects';
import type { Project } from '../types';
import { ProjectCard } from '../components/ui/ProjectCard';

type Filter = 'all' | 'in_progress' | 'completed';

const TAB_LABELS: Record<Filter, string> = {
  all: '전체',
  in_progress: '진행 중',
  completed: '완료',
};

export default function ProjectsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('프로젝트 이름을 입력해주세요.'); return; }
    setCreating(true);
    setFormError('');
    try {
      const res = await projectsApi.create(form.name.trim(), form.description.trim());
      setProjects(prev => [toProject(res), ...prev]);
      setModalOpen(false);
      setForm({ name: '', description: '' });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '생성에 실패했습니다.');
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    projectsApi.list()
      .then(res => setProjects(res.map(toProject)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const inProgressProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects  = projects.filter(p => p.status === 'completed');

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
    <div style={{ padding: '20px 16px', maxWidth: 1100 }} className="md-page-padding">

      {/* ── 헤더 ── */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>프로젝트</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            참여 중인 프로젝트와 종료된 프로젝트를 한곳에서 관리해요
          </p>
        </div>
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={ghostBtn}>필터</button>
          <button style={ghostBtn}>최근 활동 ↓</button>
        </div>
      </div>

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
              tasks={[]}
              reviews={[]}
              activities={[]}
              allUsers={[]}
              currentUserId=""
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

const ghostBtn: React.CSSProperties = {
  padding: '7px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '0.5px solid var(--border2)',
  background: 'var(--surface)',
  color: 'var(--text-secondary)',
  fontSize: 12, fontWeight: 500, cursor: 'pointer',
};
