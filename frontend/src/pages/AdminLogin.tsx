import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAdmin, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAdmin) {
      navigate('/admin');
    }
  }, [loading, isAdmin, navigate]);

  if (loading) return <p className="text-muted" style={{ padding: '24px' }}>加载中…</p>;

  // 已登录但不是管理员 → 无权限提示
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="form-wrap" style={{ textAlign: 'center' }}>
        <h1 className="form-title">无权访问</h1>
        <p className="text-muted">当前账号不是管理员，无法访问管理后台。</p>
        <p style={{ marginTop: '16px' }}><Link to="/" className="inline-link">← 返回首页</Link></p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/admin');
    } catch {
      setError('登录失败，请检查用户名和密码。');
    }
  }

  return (
    <div className="form-wrap">
      <h1 className="form-title">管理员登录</h1>
      <form onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}
        <div className="form-field">
          <input
            className="form-input"
            placeholder="用户名"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <input
            className="form-input"
            type="password"
            placeholder="密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>登录</button>
      </form>
      <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
        普通用户？<Link to="/login" className="inline-link">去登录</Link>
      </p>
    </div>
  );
}
