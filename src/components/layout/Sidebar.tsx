import { NavLink } from 'react-router-dom';
import { currentUser } from '../../data/mockData';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ProjectsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ReviewIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const navItems: NavItem[] = [
  { to: '/',         label: '홈',      icon: <HomeIcon /> },
  { to: '/projects', label: '프로젝트', icon: <ProjectsIcon /> },
  { to: '/profile',  label: '프로필',   icon: <ProfileIcon /> },
  { to: '/review',   label: '동료 평가', icon: <ReviewIcon /> },
];

// 아바타 이니셜 생성
function getInitials(name: string) {
  return name.slice(0, 1);
}

export default function Sidebar() {
  return (
    <aside
      className="sidebar-nav"
      style={{
        width: 220,
        minHeight: '100vh',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        padding: '24px 16px',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 40,
      }}
    >
      {/* 로고 */}
      <div style={{ marginBottom: 32, paddingLeft: 8 }}>
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--green)',
            letterSpacing: '-0.5px',
          }}
        >
          collabol
        </span>
      </div>

      {/* 네비게이션 */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--green)' : 'var(--text-secondary)',
              background: isActive ? 'var(--green-light)' : 'transparent',
              textDecoration: 'none',
              transition: 'background 0.15s, color 0.15s',
            })}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* 사용자 정보 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 8px',
          borderTop: '1px solid var(--border)',
          marginTop: 8,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--green-light)',
            color: 'var(--green-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 15,
            flexShrink: 0,
          }}
        >
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            getInitials(currentUser.name)
          )}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentUser.name}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentUser.department} {currentUser.grade}학년
          </p>
        </div>
      </div>
    </aside>
  );
}
