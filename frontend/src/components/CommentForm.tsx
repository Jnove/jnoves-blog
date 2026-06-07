import { useState, type FormEvent } from 'react';
import { commentsApi } from '../api/client';

interface Props {
  postId: number;
  onCommentAdded: () => void;
}

export default function CommentForm({ postId, onCommentAdded }: Props) {
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await commentsApi.create({ post_id: postId, author_name: authorName, author_email: authorEmail, content });
      setAuthorName('');
      setAuthorEmail('');
      setContent('');
      onCommentAdded();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <h3>Leave a Comment</h3>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <input
          placeholder="Your name"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          required
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
        />
        <input
          type="email"
          placeholder="Your email (won't be shown)"
          value={authorEmail}
          onChange={e => setAuthorEmail(e.target.value)}
          required
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
        />
      </div>
      <textarea
        placeholder="Write your comment..."
        value={content}
        onChange={e => setContent(e.target.value)}
        required
        rows={4}
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', marginBottom: '12px' }}
      />
      <button type="submit" disabled={submitting} style={{ padding: '8px 24px', cursor: 'pointer' }}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
