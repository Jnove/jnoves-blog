import type { Comment } from '../types';

export default function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) return <p>No comments yet. Be the first!</p>;
  return (
    <div>
      {comments.map(c => (
        <div key={c.id} style={{ marginBottom: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{c.author_name}</div>
          <div style={{ fontSize: '14px' }}>{c.content}</div>
          <div style={{ fontSize: '12px', color: 'var(--text)', marginTop: '4px' }}>
            {new Date(c.created_at).toLocaleDateString('zh-CN')}
          </div>
        </div>
      ))}
    </div>
  );
}
