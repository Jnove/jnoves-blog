import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('登录失败，请检查用户名和密码。');
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto' }}>
      <h1>用户登录</h1>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ marginBottom: '12px' }}>
          <input
            placeholder="用户名"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 24px', cursor: 'pointer', width: '100%' }}>登录</button>
      </form>
      <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
        没有账号？<Link to="/register">去注册</Link>
      </p>
    </div>
  );
}
