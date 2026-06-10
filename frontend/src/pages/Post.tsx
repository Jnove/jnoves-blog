import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { postsApi, commentsApi, likesApi } from '../api/client';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import type { Post as PostType, Comment } from '../types';

export default function Post() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

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

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleToggleLike = async () => {
    if (!post || !token) return;
    setLiking(true);
    try {
      if (liked) {
        const res = await likesApi.unlike(post.id);
        setLiked(res.liked);
        setLikeCount(res.like_count);
      } else {
        const res = await likesApi.like(post.id);
        setLiked(res.liked);
        setLikeCount(res.like_count);
      }
    } catch {
      // 静默处理（未登录会被 401 拦截器清 token）
    } finally {
      setLiking(false);
    }
  };

  if (!post) return <p>加载中…</p>;

  return (
    <article>
      <h1>{post.title}</h1>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {post.tags.map(tag => (
          <span key={tag.id} style={{ padding: '2px 8px', background: 'var(--accent-bg)', borderRadius: '4px', fontSize: '13px', color: 'var(--accent)' }}>
            {tag.name}
          </span>
        ))}
      </div>
      <div style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>{new Date(post.created_at).toLocaleDateString('zh-CN')} · {post.views} 次阅读</span>
        <button
          onClick={handleToggleLike}
          disabled={!token || liking}
          style={{
            background: 'none', border: 'none', cursor: token ? 'pointer' : 'default',
            fontSize: '16px', padding: '4px 8px', borderRadius: '6px',
            color: liked ? '#e74c3c' : 'var(--text)', opacity: liking ? 0.5 : 1,
          }}
          title={token ? (liked ? '取消点赞' : '点赞') : '登录后可点赞'}
        >
          {liked ? '❤' : '♡'} {likeCount}
        </button>
      </div>
      <div style={{ lineHeight: 1.8, marginBottom: '48px' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0' }} />
      <CommentList comments={comments} />
      <CommentForm postId={post.id} onCommentAdded={loadComments} />
    </article>
  );
}
