import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { postsApi, commentsApi } from '../api/client';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import type { Post as PostType, Comment } from '../types';

export default function Post() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const loadComments = useCallback(() => {
    if (post) commentsApi.list(post.id).then(setComments);
  }, [post]);

  useEffect(() => {
    if (!slug) return;
    postsApi.get(slug).then(setPost);
  }, [slug]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  if (!post) return <p>Loading...</p>;

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
      <div style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '24px' }}>
        {new Date(post.created_at).toLocaleDateString('zh-CN')}
      </div>
      <div style={{ lineHeight: 1.8, marginBottom: '48px' }}>
        {/* TODO: 后续替换为 Markdown/Typst 渲染 */}
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{post.content}</pre>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0' }} />
      <CommentList comments={comments} />
      <CommentForm postId={post.id} onCommentAdded={loadComments} />
    </article>
  );
}
