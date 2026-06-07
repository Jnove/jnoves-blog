import { Link } from 'react-router-dom';
import type { PostSummary } from '../types';

export default function PostCard({ post }: { post: PostSummary }) {
  const date = new Date(post.created_at).toLocaleDateString('zh-CN');
  return (
    <article style={{ marginBottom: '24px', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px' }}>
      <h2 style={{ margin: '0 0 8px', fontSize: '20px' }}>
        <Link to={`/post/${post.slug}`} style={{ color: 'var(--text-h)', textDecoration: 'none' }}>
          {post.title}
        </Link>
      </h2>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
        {post.tags.map(tag => (
          <span key={tag.id} style={{ padding: '2px 8px', background: 'var(--accent-bg)', borderRadius: '4px', fontSize: '13px', color: 'var(--accent)' }}>
            {tag.name}
          </span>
        ))}
      </div>
      <div style={{ fontSize: '14px', color: 'var(--text)' }}>
        {date} · {post.comment_count} 条评论
      </div>
    </article>
  );
}
