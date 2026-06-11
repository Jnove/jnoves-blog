// frontend/src/components/Layout.tsx
import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  // 优先读本地存储，其次跟随系统
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function Layout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // 把 data-theme 写到 <html>，让 CSS 变量全局生效
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  const handleAdminClick = () => {
    if (isAdmin) navigate('/admin');
    else if (!isAuthenticated) navigate('/admin/login');
  };

  return (
    <div>
      {/* ── Navigation ── */}
      <header className="nav">
        <Link to="/" className="nav-logo">
          Jnove<span className="dot">.</span>blog
        </Link>

        <nav className="nav-links">
          <Link to="/" className="nav-link">首页</Link>
          <Link to="/about" className="nav-link">关于</Link>
          <Link to="/search" className="nav-link">搜索</Link>
          {isAdmin && <Link to="/admin" className="nav-link">仪表盘</Link>}

          {isAuthenticated ? (
            <>
              <span className="nav-link" style={{ cursor: 'default', opacity: 0.7 }}>
                {user?.username}
              </span>
              <button
                onClick={logout}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">登录</Link>
              <button
                onClick={handleAdminClick}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
              >
                管理
              </button>
            </>
          )}

          {/* Theme toggle */}
          <button
            className="btn-theme"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
            title={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </nav>
      </header>

      {/* ── Page content ── */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
