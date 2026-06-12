import { Link } from 'react-router-dom';
import type { PostSummary } from '../types';

export default function PostCard({ post }: { post: PostSummary }) {
  const date = new Date(post.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });

  return (
    <Link to={`/post/${post.slug}`} className="post-card">
      <div className="post-card-body">
        {/* Title + summary */}
        <div className="post-card-text">
          <div className="post-card-title">{post.title}</div>
          {post.summary && (
            <div className="post-card-summary">{post.summary}</div>
          )}
          {!post.summary && post.excerpt && (
            <div className="post-card-excerpt">{post.excerpt}</div>
          )}
        </div>

        {/* Cover image thumbnail */}
        {post.cover_image && (
          <img
            className="post-card-thumb"
            src={post.cover_image}
            alt=""
            loading="lazy"
          />
        )}
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="post-card-tags">
          {post.tags.map(tag => (
            <span key={tag.id} className="post-tag">{tag.name}</span>
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="post-card-meta">
        <span>{date}</span>
        <div className="meta-dot" />
        <span>{post.reading_time} 分钟阅读</span>
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
