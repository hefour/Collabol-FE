import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="7" r="3" />
        <path d="M2 17c0-3 2.7-5 6-5" />
        <circle cx="14" cy="11" r="3" />
        <path d="M11 17c0-2 1.3-3 3-3s3 1 3 3" />
      </svg>
    ),
    title: '팀원 능력치 확인',
    desc: '팀플 전 팀원의 역량을 미리 파악하세요',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="10 2 12.5 7.5 18 8.3 14 12.1 15 17.5 10 14.8 5 17.5 6 12.1 2 8.3 7.5 7.5 10 2" />
      </svg>
    ),
    title: '동료 평가',
    desc: '프로젝트 후 서로를 평가하고 함께 성장하세요',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="4" cy="10" r="2" />
        <circle cx="16" cy="4" r="2" />
        <circle cx="16" cy="16" r="2" />
        <path d="M6 9L14 5M6 11l8 4" />
      </svg>
    ),
    title: '프로필 공유',
    desc: '나만의 협업 프로필 카드를 링크로 공유하세요',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    // TODO: 백엔드 연결 후 실제 인증 처리
    navigate('/');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ─── 왼쪽 브랜드 패널 ─── */}
      <div
        className="auth-brand-panel"
        style={{
          flex: 1,
          background: 'var(--green-dark)',
          display: 'flex',
          flexDirection: 'column',
          padding: '48px 56px',
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 'auto' }}>
          collabol
        </div>
        <div style={{ marginBottom: 56 }}>
          <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.8px', marginBottom: 16 }}>
            팀플 전<br />팀원 능력치를<br />확인하세요
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            숭실대 협업 프로필 플랫폼
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 오른쪽 로그인 폼 ─── */}
      <div style={{
        width: 480,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 52px',
        background: 'var(--surface)',
      }}
        className="auth-form-panel"
      >
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.4px' }}>
            로그인
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
            collabol 계정으로 시작하세요
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 7 }}>
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="학교 이메일을 입력하세요"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--green)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 7 }}>
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--green)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
            />
          </div>

          {error && (
            <div style={{ fontSize: 13, color: 'var(--coral)', padding: '10px 14px', background: 'var(--coral-light)', borderRadius: 'var(--radius-sm)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: '13px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--green)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '-0.2px',
            }}
          >
            로그인
          </button>
        </form>

        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 14, color: 'var(--text-tertiary)' }}>
          아직 계정이 없으신가요?{' '}
          <Link to="/register" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border2)',
  background: 'var(--bg)',
  fontSize: 14,
  color: 'var(--text-primary)',
  outline: 'none',
  transition: 'border-color 0.15s',
};
