import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const GRADE_OPTIONS = ['1학년', '2학년', '3학년', '4학년 이상'];
const CODE_DURATION = 180; // 3분

// ─── 스타일 헬퍼 ──────────────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
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

function focusBorder(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'var(--green)';
}
function blurBorder(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'var(--border2)';
}

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

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    grade: '',
  });

  // 이메일 인증
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [codeError, setCodeError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [error, setError] = useState('');

  function setField(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  }

  // 타이머 정리
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(CODE_DURATION);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  function handleSendCode() {
    if (!form.email) { setError('이메일을 입력해주세요.'); return; }
    // TODO: 백엔드 API 호출 — POST /api/v1/auth/email/send
    setCodeSent(true);
    setVerified(false);
    setCode('');
    setCodeError('');
    startTimer();
  }

  function handleVerifyCode() {
    if (!code) { setCodeError('인증번호를 입력해주세요.'); return; }
    if (timer === 0) { setCodeError('인증 시간이 만료됐어요. 다시 받아주세요.'); return; }
    // TODO: 백엔드 API 호출 — POST /api/v1/auth/email/verify
    // 현재는 mock: 6자리면 통과
    if (code.length === 6) {
      setVerified(true);
      setCodeError('');
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setCodeError('인증번호가 올바르지 않아요.');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { name, email, password, confirmPassword, department, grade } = form;

    if (!name || !email || !password || !confirmPassword || !department || !grade) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (!verified) {
      setError('이메일 인증을 완료해주세요.');
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
          collaball
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
            이메일 인증 후 collaball을 시작하세요
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 이름 */}
          <Field label="이름">
            <input
              type="text"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              placeholder="홍길동"
              style={inputBase}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
          </Field>

          {/* 이메일 + 인증번호 받기 */}
          <Field label="이메일">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                value={form.email}
                onChange={e => { setField('email', e.target.value); setCodeSent(false); setVerified(false); }}
                placeholder="example@soongsil.ac.kr"
                style={{ ...inputBase, flex: 1 }}
                disabled={verified}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={verified}
                style={{
                  padding: '0 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--green)',
                  background: verified ? 'var(--surface2)' : 'transparent',
                  color: verified ? 'var(--text-tertiary)' : 'var(--green)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: verified ? 'default' : 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {codeSent && !verified ? '재발송' : '인증번호 받기'}
              </button>
            </div>
          </Field>

          {/* 인증번호 입력 (코드 발송 후 표시) */}
          {codeSent && !verified && (
            <div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    value={code}
                    onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setCodeError(''); }}
                    placeholder="인증번호 6자리"
                    maxLength={6}
                    style={{ ...inputBase, paddingRight: 56 }}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                  />
                  {timer > 0 && (
                    <span style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      fontSize: 13, fontWeight: 500,
                      color: timer < 30 ? 'var(--coral)' : 'var(--text-tertiary)',
                    }}>
                      {formatTime(timer)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  style={{
                    padding: '0 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'var(--green)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  인증하기
                </button>
              </div>
              {codeError && (
                <div style={{ fontSize: 12, color: 'var(--coral)', marginTop: 6 }}>{codeError}</div>
              )}
            </div>
          )}

          {/* 인증 완료 표시 */}
          {verified && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: 'var(--green-mid)',
              padding: '9px 14px',
              background: 'var(--green-light)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="2 7 6 11 12 4" />
              </svg>
              이메일 인증이 완료됐어요
            </div>
          )}

          {/* 비밀번호 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="비밀번호">
              <input
                type="password"
                value={form.password}
                onChange={e => setField('password', e.target.value)}
                placeholder="8자 이상"
                style={inputBase}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </Field>
            <Field label="비밀번호 확인">
              <input
                type="password"
                value={form.confirmPassword}
                onChange={e => setField('confirmPassword', e.target.value)}
                placeholder="다시 입력"
                style={inputBase}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </Field>
          </div>

          {/* 학과 + 학년 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="학과">
              <input
                type="text"
                value={form.department}
                onChange={e => setField('department', e.target.value)}
                placeholder="예) 컴퓨터학부"
                style={inputBase}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </Field>
            <Field label="학년">
              <select
                value={form.grade}
                onChange={e => setField('grade', e.target.value)}
                style={{ ...inputBase, cursor: 'pointer' }}
              >
                <option value="">선택</option>
                {GRADE_OPTIONS.map(g => (
                  <option key={g} value={g}>{g}</option>
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
