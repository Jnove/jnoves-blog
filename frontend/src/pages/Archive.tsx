import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from '../api/client';
import type { ArchiveGroup } from '../types';

export default function Archive() {
  const [groups, setGroups] = useState<ArchiveGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postsApi.archive()
      .then(setGroups)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', paddingTop: 32 }}>
      <h1 className="form-title">文章归档</h1>
      <p className="text-muted" style={{ marginBottom: 32, fontSize: 14 }}>
        {loading ? '加载中…' : `共 ${groups.reduce((s, g) => s + g.count, 0)} 篇文章`}
      </p>

      {loading ? (
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-card" style={{ height: 80 }} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <div className="empty-state-text">暂无文章</div>
        </div>
      ) : (
        <div>
          {groups.map(group => (
            <section key={`${group.year}-${group.month}`} style={{ marginBottom: 36 }}>
              <h2 style={{
                fontSize: 18, fontWeight: 530, color: 'var(--txt)',
                marginBottom: 12, display: 'flex', alignItems: 'baseline', gap: 10,
              }}>
                {group.label}
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--txt2)' }}>
                  {group.count} 篇
                </span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {group.posts.map(post => (
                  <Link
                    key={post.id}
                    to={`/post/${post.slug}`}
                    className="archive-item"
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                      padding: '8px 0', borderBottom: '1px solid var(--bd)',
                      textDecoration: 'none', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--acc)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'inherit'; }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.title}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--txt2)', flexShrink: 0, marginLeft: 16 }}>
                      {new Date(post.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
