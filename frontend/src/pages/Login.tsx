import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/client';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubAvailable, setGithubAvailable] = useState(false);
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    authApi.githubUrl().then(() => setGithubAvailable(true)).catch(() => {});
  }, []);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // GitHub OAuth callback — backend redirects here with token
  const githubToken = searchParams.get('github_token');
  if (githubToken) {
    localStorage.setItem('token', githubToken);
    navigate('/');
    window.location.reload();
    return null;
  }

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
      <h1 className="form-title">用户登录</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}
        <div className="form-field">
          <input className="form-input" placeholder="用户名" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="form-field">
          <input className="form-input" type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>登录</button>
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
            {githubLoading ? '跳转中…' : '使用 GitHub 登录'}
          </button>
        </>
      )}

      <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
        没有账号？<Link to="/register" className="inline-link">去注册</Link>
      </p>
    </div>
  );
}
