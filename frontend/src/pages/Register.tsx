import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  function validate(): string | null {
    if (username.length < 2) return '用户名至少 2 个字符';
    if (!email.includes('@')) return '请输入有效的邮箱地址';
    if (password.length < 6) return '密码至少 6 个字符';
    if (password !== confirm) return '两次密码输入不一致';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const msg = validate();
    if (msg) { setError(msg); return; }
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail || '注册失败，请稍后再试。');
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto' }}>
      <h1>注册账号</h1>
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
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="password"
            placeholder="密码（至少 6 位）"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="password"
            placeholder="确认密码"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 24px', cursor: 'pointer', width: '100%' }}>注册</button>
      </form>
      <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
        已有账号？<Link to="/login">去登录</Link>
      </p>
    </div>
  );
}
