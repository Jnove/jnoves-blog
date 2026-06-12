import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/client';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubAvailable, setGithubAvailable] = useState(false);
  const { register, isAuthenticated } = useAuth();

  useEffect(() => {
    authApi.githubUrl().then(() => setGithubAvailable(true)).catch(() => {});
  }, []);
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

  async function handleGitHubLogin() {
    setGithubLoading(true);
    try {
      const { url } = await authApi.githubUrl();
      window.location.href = url;
    } catch {
      setError('GitHub OAuth 未配置');
      setGithubLoading(false);
    }
  }

  return (
    <div className="form-wrap">
      <h1 className="form-title">注册账号</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}
        <div className="form-field">
          <input className="form-input" placeholder="用户名" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="form-field">
          <input className="form-input" type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="form-field">
          <input className="form-input" type="password" placeholder="密码（至少 6 位）" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="form-field">
          <input className="form-input" type="password" placeholder="确认密码" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>注册</button>
      </form>

      {githubAvailable && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--bd)' }} />
            <span style={{ fontSize: '12px', color: 'var(--txt2)' }}>或</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--bd)' }} />
          </div>

          <button
            className="btn btn-ghost"
            onClick={handleGitHubLogin}
            disabled={githubLoading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            {githubLoading ? '跳转中…' : '使用 GitHub 注册'}
          </button>
        </>
      )}

      <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
        已有账号？<Link to="/login" className="inline-link">去登录</Link>
      </p>
    </div>
  );
}
