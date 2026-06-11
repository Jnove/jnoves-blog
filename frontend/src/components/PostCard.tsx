import { Link } from 'react-router-dom';
import type { PostSummary } from '../types';

export default function PostCard({ post }: { post: PostSummary }) {
  const date = new Date(post.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });

  return (
    <Link to={`/post/${post.slug}`} className="post-card">
      {/* Title */}
      <div className="post-card-title">{post.title}</div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="post-card-tags">
          {post.tags.map(tag => (
            <span key={tag.id} className="post-tag">{tag.name}</span>
          ))}
        </div>
      )}

      {/* Meta — views / comments / likes */}
      <div className="post-card-meta">
        <span>{date}</span>
        <div className="meta-dot" />
        <span>{post.views} 阅读</span>
        {post.comment_count > 0 && (
          <>
            <div className="meta-dot" />
            <span>{post.comment_count} 评论</span>
          </>
        )}
        {post.like_count > 0 && (
          <>
            <div className="meta-dot" />
            <span>♡ {post.like_count}</span>
          </>
        )}
      </div>
    </Link>
  );
}
