import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/');
    }
  };

  return (
    <div>
      <header style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '24px', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', fontWeight: 600, fontSize: '20px', color: 'var(--text-h)' }}>
          Jnove&apos;s Blog
        </Link>
        <nav style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <Link to="/">首页</Link>
          <Link to="/about">关于</Link>
          <Link to="/search">搜索</Link>
          {isAdmin && <Link to="/admin">仪表盘</Link>}
        </nav>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '14px' }}>
          {isAuthenticated ? (
            <>
              <span style={{ color: 'var(--text)' }}>你好, {user?.username}</span>
              <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', opacity: 0.6 }}>
                退出
              </button>
            </>
          ) : (
            <>
              <Link to="/login">登录</Link>
              <button
                onClick={handleAdminClick}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', opacity: 0.6, fontSize: '14px' }}
              >
                管理
              </button>
            </>
          )}
        </div>
      </header>
      <main style={{ padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  );
}
