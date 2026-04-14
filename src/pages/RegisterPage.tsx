import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DEPARTMENTS } from '../types';

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 7 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    department: '',
    grade: '',
  });
  const [error, setError] = useState('');

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  }

  function focusBorder(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = 'var(--green)';
  }
  function blurBorder(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = 'var(--border2)';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { name, email, password, confirmPassword, studentId, department, grade } = form;

    if (!name || !email || !password || !confirmPassword || !studentId || !department || !grade) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않아요.');
      return;
    }
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 해요.');
      return;
    }
    // TODO: 백엔드 연결 후 실제 회원가입 처리
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
          justifyContent: 'center',
          padding: '48px 56px',
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 32 }}>
          collabol
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.8px', marginBottom: 16 }}>
          협업 프로필을<br />지금 만들어보세요
        </div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
          팀플 전 팀원의 능력치를 확인하고<br />
          프로젝트 후 동료 평가로<br />
          나만의 협업 프로필을 쌓아가세요.
        </div>
      </div>

      {/* ─── 오른쪽 회원가입 폼 ─── */}
      <div
        className="auth-form-panel"
        style={{
          width: 480,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 52px',
          background: 'var(--surface)',
          overflowY: 'auto',
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.4px' }}>
            회원가입
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
            숭실대 학번으로 가입하세요
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="이름">
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="홍길동"
              style={inputStyle}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
          </Field>

          <Field label="이메일">
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="example@soongsil.ac.kr"
              style={inputStyle}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="비밀번호">
              <input
                type="password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="8자 이상"
                style={inputStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </Field>
            <Field label="비밀번호 확인">
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
                placeholder="다시 입력"
                style={inputStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </Field>
          </div>

          <Field label="학번">
            <input
              type="text"
              value={form.studentId}
              onChange={e => set('studentId', e.target.value)}
              placeholder="20201234"
              style={inputStyle}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="학과">
              <select
                value={form.department}
                onChange={e => set('department', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={focusBorder}
                onBlur={blurBorder}
              >
                <option value="">학과 선택</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="학년">
              <select
                value={form.grade}
                onChange={e => set('grade', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={focusBorder}
                onBlur={blurBorder}
              >
                <option value="">학년 선택</option>
                {[1, 2, 3, 4].map(g => (
                  <option key={g} value={g}>{g}학년</option>
                ))}
              </select>
            </Field>
          </div>

          {error && (
            <div style={{ fontSize: 13, color: 'var(--coral)', padding: '10px 14px', background: 'var(--coral-light)', borderRadius: 'var(--radius-sm)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: 6,
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
            가입하기
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--text-tertiary)' }}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
