import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { AdminStats } from '../types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.stats()
      .then(setStats)
      .catch(() => setError('获取统计数据失败'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>加载中…</p>;
  if (error) return (
    <div>
      <p>{error}</p>
      <Link to="/admin/login" style={{ color: 'var(--accent)' }}>前往登录</Link>
    </div>
  );
  if (!stats) return null;

  return (
    <div>
      <h1>管理仪表盘</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginTop: '24px' }}>
        <StatCard label="文章总数" value={stats.post_count} />
        <StatCard label="已发布" value={stats.published_count} />
        <StatCard label="评论数" value={stats.comment_count} />
        <StatCard label="标签数" value={stats.tag_count} />
        <StatCard label="总阅读量" value={stats.total_views} />
      </div>
      <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
        <Link to="/admin/editor" style={{ padding: '8px 20px', background: 'var(--accent-bg)', borderRadius: '6px', color: 'var(--accent)', textDecoration: 'none' }}>
          写新文章
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
      <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '14px', color: 'var(--text)' }}>{label}</div>
    </div>
  );
}
