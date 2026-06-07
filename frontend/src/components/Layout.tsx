import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
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
        </nav>
        <Link to="/admin/login" style={{ fontSize: '14px', opacity: 0.6 }}>
          管理
        </Link>
      </header>
      <main style={{ padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  );
}
