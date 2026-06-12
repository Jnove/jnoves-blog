import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { commentsApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface ReplyTarget {
  id?: number;
  author: string;
  text: string;
}

interface Props {
  postId: number;
  onCommentAdded: () => void;
  replyTarget: ReplyTarget | null;
  onCancelReply: () => void;
}

export default function CommentForm({ postId, onCommentAdded, replyTarget, onCancelReply }: Props) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const quoteText = replyTarget?.id
        ? (replyTarget.text.length > 200 ? replyTarget.text.slice(0, 200) + '…' : replyTarget.text)
        : undefined;
      await commentsApi.create({
        post_id: postId,
        content,
        parent_id: replyTarget?.id,
        quote: quoteText,
      });
      setContent('');
      if (replyTarget) onCancelReply();
      onCommentAdded();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{ fontSize: '17px', fontWeight: 500, marginBottom: '12px' }}>
        {replyTarget ? <span>回复 <strong>{replyTarget.author}</strong></span> : '发表评论'}
        {replyTarget && (
          <button
            onClick={onCancelReply}
            style={{ marginLeft: 10, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt2)' }}
          >取消</button>
        )}
      </h3>
      {isAuthenticated ? (
        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: '14px', color: 'var(--txt2)', marginBottom: '8px' }}>
            以 <strong style={{ color: 'var(--txt)' }}>{user?.username}</strong> 的身份评论
          </p>
          {replyTarget?.id && (
            <blockquote style={{
              borderLeft: '3px solid var(--acc)', margin: '0 0 10px', padding: '6px 12px',
              color: 'var(--txt2)', fontSize: '13px', fontStyle: 'italic',
              background: 'var(--acc-bg)', borderRadius: '0 6px 6px 0',
            }}>
              {replyTarget.text.length > 200 ? replyTarget.text.slice(0, 200) + '…' : replyTarget.text}
            </blockquote>
          )}
          <textarea
            className="form-textarea"
            placeholder={replyTarget ? '写下你的回复…' : '写下你的想法…'}
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={4}
            style={{ marginBottom: '12px' }}
          />
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? '提交中…' : replyTarget ? '回复' : '提交评论'}
          </button>
        </form>
      ) : (
        <p style={{
          padding: '14px 16px', background: 'var(--acc-bg)',
          borderRadius: '8px', fontSize: '14px', color: 'var(--acc-tx)',
        }}>
          <Link to="/login" className="inline-link">登录</Link>后即可发表评论
        </p>
      )}
    </div>
  );
}
