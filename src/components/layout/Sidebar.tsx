import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userApi, type UserMeResponse } from '../../api/user';

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
  { to: '/home',     label: '홈',      icon: <HomeIcon /> },
  { to: '/projects', label: '프로젝트', icon: <ProjectsIcon /> },
  { to: '/profile',  label: '프로필',   icon: <ProfileIcon /> },
  { to: '/review',   label: '동료 평가', icon: <ReviewIcon /> },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserMeResponse | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    userApi.me().then(setProfile).catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

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
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 로고 */}
      <div style={{ marginBottom: 32, paddingLeft: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', letterSpacing: '-0.5px' }}>
          collaball
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

      {/* 사용자 정보 + 로그아웃 */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px', marginBottom: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: 'var(--green-light)', color: 'var(--green-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 15,
          }}>
            {profile?.name?.[0] ?? '?'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.name ?? ''}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.department ?? ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowLogoutModal(true)}
          style={{
            width: '100%', padding: '8px 12px',
            display: 'flex', alignItems: 'center', gap: 8,
            borderRadius: 'var(--radius-md)', border: 'none',
            background: 'transparent', cursor: 'pointer',
            fontSize: 13, color: 'var(--text-tertiary)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          로그아웃
        </button>
      </div>

      {/* 로그아웃 확인 모달 */}
      {showLogoutModal && (
        <div
          onClick={() => setShowLogoutModal(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 28px 24px',
              width: 320,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>로그아웃</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              정말 로그아웃 하시겠어요?
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1, padding: '10px 0',
                  background: 'var(--green)', color: '#fff',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                로그아웃
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1, padding: '10px 0',
                  background: 'var(--surface2)', color: 'var(--text-secondary)',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
