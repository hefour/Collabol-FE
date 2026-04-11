import { useParams } from 'react-router-dom';

export default function SharePage() {
  const { userId } = useParams<{ userId: string }>();

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>프로필 공유</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>userId: {userId}</p>
    </div>
  );
}
