import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/client';
import type { AdminStats, AdminComment } from '../types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'stats' | 'comments'>('stats');

  // Comments state
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentPage, setCommentPage] = useState(1);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    adminApi.stats()
      .then(setStats)
      .catch(() => setError('获取统计数据失败'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== 'comments') return;
    setCommentLoading(true);
    adminApi.comments(commentPage)
      .then(data => { setComments(data.items); setCommentTotal(data.total); })
      .catch(() => {})
      .finally(() => setCommentLoading(false));
  }, [tab, commentPage]);

  async function handleDeleteComment(id: number) {
    if (!confirm('确定要删除这条评论吗？')) return;
    try {
      await adminApi.deleteComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
      setCommentTotal(prev => prev - 1);
    } catch { /* ignore */ }
  }

  if (loading) return <p className="text-muted">加载中…</p>;
  if (error) return (
    <div>
      <p className="form-error">{error}</p>
      <Link to="/admin/login" className="inline-link">前往登录</Link>
    </div>
  );
  if (!stats) return null;

  const commentPages = Math.ceil(commentTotal / 20);

  return (
    <div>
      <h1 className="form-title">管理仪表盘</h1>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          className={`btn${tab === 'stats' ? ' btn-primary' : ' btn-ghost'}`}
          onClick={() => setTab('stats')}
        >统计</button>
        <button
          className={`btn${tab === 'comments' ? ' btn-primary' : ' btn-ghost'}`}
          onClick={() => setTab('comments')}
        >评论管理</button>
      </div>

      {tab === 'stats' && (
        <>
          <div className="stats-grid">
            <StatCard label="文章总数" value={stats.post_count} />
            <StatCard label="已发布" value={stats.published_count} />
            <StatCard label="评论数" value={stats.comment_count} />
            <StatCard label="标签数" value={stats.tag_count} />
            <StatCard label="总阅读量" value={stats.total_views} />
          </div>
          <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
            <Link to="/admin/editor" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              写新文章
            </Link>
            <Link to="/admin/about" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
              编辑关于页
            </Link>
          </div>
        </>
      )}

      {tab === 'comments' && (
        <>
          {commentLoading ? (
            <p className="text-muted">加载中…</p>
          ) : comments.length === 0 ? (
            <p className="text-muted">暂无评论</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {comments.map(c => (
                <div key={c.id} className="admin-comment-item">
                  <div className="admin-comment-header">
                    <div>
                      <span className="admin-comment-author">{c.author_name}</span>
                      <span className="admin-comment-date">
                        {new Date(c.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: '13px', padding: '4px 12px' }}
                      onClick={() => handleDeleteComment(c.id)}
                    >删除</button>
                  </div>
                  <p className="admin-comment-body">{c.content}</p>
                  <div className="admin-comment-blog">
                    文章：<Link to={`/post/${c.blog_slug}`} className="inline-link">{c.blog_title}</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          {commentPages > 1 && (
            <div className="pagination" style={{ marginTop: '20px' }}>
              <button className="btn btn-ghost" disabled={commentPage <= 1} onClick={() => setCommentPage(p => p - 1)}>上一页</button>
              <span className="page-info">第 {commentPage} / {commentPages} 页</span>
              <button className="btn btn-ghost" disabled={commentPage >= commentPages} onClick={() => setCommentPage(p => p + 1)}>下一页</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}