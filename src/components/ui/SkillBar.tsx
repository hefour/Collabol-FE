import type { SkillRating } from '../../types';

interface SkillBarProps {
  rating: SkillRating;
}

export function SkillBar({ rating }: SkillBarProps) {
  const pct = (rating.score / 5) * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span
        style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          width: 88,
          flexShrink: 0,
        }}
      >
        {rating.tag}
      </span>
      <div
        style={{
          flex: 1,
          height: 5,
          background: 'var(--surface2)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 3,
            background: 'var(--green)',
          }}
        />
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-primary)',
          width: 28,
          textAlign: 'right',
        }}
      >
        {rating.score.toFixed(1)}
      </span>
    </div>
  );
}
