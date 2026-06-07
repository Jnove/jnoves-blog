import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div>
      <header style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '24px', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', fontWeight: 600, fontSize: '20px', color: 'var(--text-h)' }}>
          Jnove&apos;s Blog
        </Link>
        <nav style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/search">Search</Link>
        </nav>
      </header>
      <main style={{ padding: '24px' }}>
        <Outlet />
      </main>
    </div>
  );
}
