import { useNavigate } from 'react-router-dom';
import type { Project, Task } from '../../types';
import { AvatarGroup } from './Avatar';

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  currentUserId?: string;
  onEvaluate?: (projectId: string) => void;
}

const STATUS_CONFIG: Record<Project['status'], { label: string; bg: string; color: string }> = {
  in_progress: { label: '진행 중',  bg: 'var(--green-light)',  color: 'var(--green-mid)' },
  recruiting:  { label: '모집 중',  bg: 'var(--blue-light)',   color: 'var(--blue-dark)' },
  completed:   { label: '평가 대기', bg: 'var(--amber-light)',  color: 'var(--amber-dark)' },
};

function getDDay(dueDate?: string) {
  if (!dueDate) return null;
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: '마감됨', urgent: false };
  if (diff === 0) return { label: 'D-Day', urgent: true };
  return { label: `D-${diff}`, urgent: diff <= 7 };
}

export function ProjectCard({ project, tasks, currentUserId, onEvaluate }: ProjectCardProps) {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[project.status];
  const done = tasks.filter(t => t.status === 'done').length;
  const total = tasks.length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  const dday = getDDay(project.dueDate);
  const isCompleted = project.status === 'completed';

  return (
    <div
      onClick={() => navigate('/projects')}
      style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        cursor: 'pointer',
        transition: 'border-color 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = 'var(--border2)';
        el.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = 'var(--border)';
        el.style.transform = 'translateY(0)';
      }}
    >
      {/* 상단: 제목 + 상태 배지 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            {project.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            {project.tags.join(' · ')}
          </div>
        </div>
        <div
          style={{
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 500,
            background: status.bg,
            color: status.color,
            flexShrink: 0,
          }}
        >
          {status.label}
        </div>
      </div>

      {/* 태스크 진행률 */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>태스크 완료율</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>
            {done} / {total}
          </span>
        </div>
        <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              borderRadius: 2,
              background: pct < 30 ? 'var(--amber)' : 'var(--green)',
            }}
          />
        </div>
      </div>

      {/* 하단: 멤버 아바타 + D-day */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <AvatarGroup members={project.members} currentUserId={currentUserId} size={26} />
        {isCompleted ? (
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>완료됨</span>
        ) : dday ? (
          <span
            style={{
              fontSize: 12,
              color: dday.urgent ? 'var(--coral)' : 'var(--text-tertiary)',
              fontWeight: dday.urgent ? 500 : 400,
            }}
          >
            {dday.label}
          </span>
        ) : null}
      </div>

      {/* 평가 배너 (완료된 프로젝트) */}
      {isCompleted && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--amber-light)',
            borderRadius: 'var(--radius-sm)',
            padding: '9px 12px',
            marginTop: 12,
          }}
        >
          <div style={{ width: 6, height: 6, background: 'var(--amber)', borderRadius: '50%', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'var(--amber-dark)', flex: 1 }}>
            팀원 동료 평가를 아직 작성하지 않았어요
          </span>
          <button
            onClick={e => {
              e.stopPropagation();
              onEvaluate?.(project.id);
            }}
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--amber-dark)',
              border: '0.5px solid var(--amber)',
              borderRadius: 6,
              padding: '3px 9px',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            평가하기
          </button>
        </div>
      )}
    </div>
  );
}
