const AVATAR_COLORS = [
  { bg: 'var(--green-light)',  color: 'var(--green-mid)' },
  { bg: 'var(--purple-light)', color: 'var(--purple-dark)' },
  { bg: 'var(--coral-light)',  color: '#712B13' },
  { bg: 'var(--blue-light)',   color: 'var(--blue-dark)' },
  { bg: 'var(--pink-light)',   color: 'var(--pink-dark)' },
];

interface AvatarProps {
  name: string;
  size?: number;
  colorIndex?: number;
  border?: boolean;
}

export function Avatar({ name, size = 32, colorIndex = 0, border = false }: AvatarProps) {
  const { bg, color } = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(size * 0.34),
        fontWeight: 600,
        flexShrink: 0,
        border: border ? '2px solid var(--surface)' : 'none',
      }}
    >
      {name.slice(0, 1)}
    </div>
  );
}

interface AvatarGroupProps {
  members: Array<{ userId: string; name: string }>;
  currentUserId?: string;
  size?: number;
}

export function AvatarGroup({ members, currentUserId, size = 26 }: AvatarGroupProps) {
  const ordered = [
    ...members.filter(m => m.userId === currentUserId),
    ...members.filter(m => m.userId !== currentUserId),
  ];
  return (
    <div style={{ display: 'flex' }}>
      {ordered.map((m, i) => (
        <div key={m.userId} style={{ marginLeft: i === 0 ? 0 : -7 }}>
          <Avatar name={m.name} size={size} colorIndex={i} border />
        </div>
      ))}
    </div>
  );
}
