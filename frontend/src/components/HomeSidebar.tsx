import { useEffect, useState } from 'react';
import { tagsApi } from '../api/client';
import type { Tag } from '../types';

export default function HomeSidebar() {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => { tagsApi.list().then(setTags); }, []);

  return (
    <aside className="home-sidebar">
      {/* Author card */}
      <div className="sidebar-card">
        <div className="sidebar-avatar">J</div>
        <h3 className="sidebar-name">Jnove</h3>
        <p className="sidebar-bio">个人技术博客，记录学习与思考。</p>
      </div>

      {/* Search shortcut */}
      <div className="sidebar-card">
        <h4 className="sidebar-label">搜索文章</h4>
        <form onSubmit={e => { e.preventDefault(); window.location.href = '/search?q=' + encodeURIComponent((e.target as any).q.value); }} style={{ display: 'flex', gap: 6 }}>
          <input name="q" className="form-input" placeholder="关键词…" style={{ fontSize: 13, padding: '7px 10px' }} />
          <button type="submit" className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}>搜索</button>
        </form>
      </div>

      {/* Tag cloud */}
      {tags.length > 0 && (
        <div className="sidebar-card">
          <h4 className="sidebar-label">标签</h4>
          <div className="tag-cloud">
            {tags.map(tag => (
              <a key={tag.id} href={'/?tag=' + tag.slug} className="tag-cloud-item">
                {tag.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
