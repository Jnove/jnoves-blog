import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { commentsApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  postId: number;
  onCommentAdded: () => void;
}

export default function CommentForm({ postId, onCommentAdded }: Props) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await commentsApi.create({ post_id: postId, content });
      setContent('');
      onCommentAdded();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <h3>发表评论</h3>
      {isAuthenticated ? (
        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '8px' }}>
            以 <strong>{user?.username}</strong> 的身份评论
          </p>
          <textarea
            placeholder="写下你的想法…"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={4}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', marginBottom: '12px' }}
          />
          <button type="submit" disabled={submitting} style={{ padding: '8px 24px', cursor: 'pointer' }}>
            {submitting ? '提交中…' : '提交评论'}
          </button>
        </form>
      ) : (
        <p style={{ padding: '16px', background: 'var(--accent-bg)', borderRadius: '8px', fontSize: '14px' }}>
          <Link to="/login" style={{ color: 'var(--accent)' }}>登录</Link>后即可发表评论
        </p>
      )}
    </div>
  );
}
