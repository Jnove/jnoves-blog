// frontend/src/pages/Post.tsx
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { postsApi, commentsApi, likesApi } from '../api/client';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import type { Post as PostType, Comment } from '../types';

export default function Post() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost]         = useState<PostType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked]       = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking]     = useState(false);

  const token = localStorage.getItem('token');

  const loadComments = useCallback(() => {
    if (post) commentsApi.list(post.id).then(setComments);
  }, [post]);

  useEffect(() => {
    if (!slug) return;
    postsApi.get(slug).then(p => {
      setPost(p);
      setLikeCount(p.like_count ?? 0);
      likesApi.check(p.id).then(s => setLiked(s.liked));
    });
  }, [slug]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const handleToggleLike = async () => {
    if (!post || !token) return;
    setLiking(true);
    try {
      const res = liked
        ? await likesApi.unlike(post.id)
        : await likesApi.like(post.id);
      setLiked(res.liked);
      setLikeCount(res.like_count);
    } catch { /* 401 handled by interceptor */ }
    finally { setLiking(false); }
  };

  if (!post) return <p className="text-muted" style={{ padding: '24px 0' }}>加载中…</p>;

  const date = new Date(post.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <article style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div className="article-header">
        <h1 className="article-title">{post.title}</h1>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="post-card-tags" style={{ marginBottom: 12 }}>
            {post.tags.map(tag => (
              <span key={tag.id} className="post-tag">{tag.name}</span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div className="article-meta">
          <span>{date}</span>
          <div className="meta-dot" />
          <span>{post.views} 次阅读</span>

          {/* Like button */}
          <button
            className={`btn-like${liked ? ' liked' : ''}`}
            onClick={handleToggleLike}
            disabled={!token || liking}
            title={token ? (liked ? '取消点赞' : '点赞') : '登录后可点赞'}
          >
            {liked ? '❤' : '♡'} {likeCount}
          </button>
        </div>
      </div>

      {/* Body: prose class applies serif font  */}
      <div className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>

      {/*  Comments */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--bd)', margin: '40px 0 28px' }} />
      <CommentList comments={comments} />
      <CommentForm postId={post.id} onCommentAdded={loadComments} />
    </article>
  );
}
