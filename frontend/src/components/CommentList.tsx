import type { Comment } from '../types';

interface Props {
  comments: Comment[];
  depth?: number;
  replyTarget: { id: number; author: string; text: string } | null;
  onReplyClick: (id: number, author: string, text: string) => void;
}

function CommentItem({ comment, depth, replyTarget, onReplyClick }: { comment: Comment; depth: number } & Omit<Props, 'comments'>) {
  const date = new Date(comment.created_at).toLocaleDateString('zh-CN');

  return (
    <div className="comment-item" style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      {comment.quote && (
        <blockquote style={{
          borderLeft: '3px solid var(--acc)', margin: '0 0 8px', padding: '6px 12px',
          color: 'var(--txt2)', fontSize: '13px', fontStyle: 'italic',
          background: 'var(--acc-bg)', borderRadius: '0 6px 6px 0',
        }}>
          {comment.quote}
        </blockquote>
      )}

      <div className="comment-author">{comment.author_name}</div>
      <div className="comment-content">{comment.content}</div>
      <div className="comment-date">
        {date}
        <button
          style={{ marginLeft: 10, fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--acc)' }}
          onClick={() => onReplyClick(comment.id, comment.author_name, comment.content)}
        >回复</button>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {comment.replies.map(r => (
            <CommentItem key={r.id} comment={r} depth={depth + 1} replyTarget={replyTarget} onReplyClick={onReplyClick} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentList({ comments, replyTarget, onReplyClick }: Props) {
  if (comments.length === 0) return (
    <div className="empty-state" style={{ padding: '32px 20px' }}>
      <div className="empty-state-icon">💬</div>
      <div className="empty-state-text">暂无评论，来抢沙发！</div>
    </div>
  );

  return (
    <div style={{ marginBottom: '24px' }}>
      {replyTarget && (
        <div style={{
          padding: '10px 14px', marginBottom: '12px', background: 'var(--surf2)',
          borderRadius: '7px', fontSize: '13px', color: 'var(--txt2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>回复 <strong>{replyTarget.author}</strong></span>
        </div>
      )}
      {comments.map(c => (
        <CommentItem key={c.id} comment={c} depth={0} replyTarget={replyTarget} onReplyClick={onReplyClick} />
      ))}
    </div>
  );
}
