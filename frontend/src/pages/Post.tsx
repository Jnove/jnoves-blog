import { useCallback, useEffect, useState, Suspense, lazy } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { postsApi, commentsApi, likesApi } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import CommentList from '../components/CommentList';
import CommentForm from '../components/CommentForm';
import CodeBlock from '../components/CodeBlock';
import TableOfContents from '../components/TableOfContents';

const TypstBody = lazy(() => import('../components/TypstRenderer'));
import { useIsDark } from '../hooks/useIsDark';
import type { Post as PostType, Comment } from '../types';

function headingId(text: string): string {
  return text
    .replace(/[`*_~\[\]()]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w一-鿿-]/g, '');
}

export default function Post() {
  const { slug } = useParams<{ slug: string }>();
  const { isAdmin } = useAuth();
  const [post, setPost]         = useState<PostType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked]       = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking]     = useState(false);
  const [replyTarget, setReplyTarget] = useState<{ id: number; author: string; text: string } | null>(null);
  const onReplyClick = (id: number, author: string, text: string) => setReplyTarget({ id, author, text });

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
    if (!post) return;
    setLiking(true);
    try {
      const res = liked
        ? await likesApi.unlike(post.id)
        : await likesApi.like(post.id);
      setLiked(res.liked);
      setLikeCount(res.like_count);
    } catch { /* 409 */ }
    finally { setLiking(false); }
  };

  const isDark = useIsDark();

  if (!post) return <p className="text-muted" style={{ padding: '24px 0' }}>加载中…</p>;

  const date = new Date(post.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="article-layout">
      <article className="article-main" style={{ maxWidth: 720 }}>
        {/* Cover image */}
        {post.cover_image && (
          <img src={post.cover_image} alt="" className="article-cover" />
        )}

        {/* Header */}
        <div className="article-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <h1 className="article-title" style={{ flex: 1 }}>{post.title}</h1>
            {isAdmin && (
              <Link to={`/admin/editor?edit=${post.slug}`} className="btn btn-ghost" style={{ fontSize: '13px', textDecoration: 'none', flexShrink: 0, marginTop: 4 }}>
                编辑
              </Link>
            )}
          </div>

          {/* Summary */}
          {post.summary && (
            <div className="article-summary">{post.summary}</div>
          )}

          {post.tags.length > 0 && (
            <div className="post-card-tags" style={{ marginBottom: 12 }}>
              {post.tags.map(tag => (
                <span key={tag.id} className="post-tag">{tag.name}</span>
              ))}
            </div>
          )}

          <div className="article-meta">
            <span>{date}</span>
            <div className="meta-dot" />
            <span>{post.views} 次阅读</span>
            <button
              className={`btn-like${liked ? ' liked' : ''}`}
              onClick={handleToggleLike}
              disabled={liking}
              title={liked ? '取消点赞' : '点赞'}
            >
              {liked ? '❤' : '♡'} {likeCount}
            </button>
          </div>
        </div>

        {/* Body — 根据 format 切换渲染引擎 */}
        {post.format === 'typst' ? (
          <Suspense fallback={<div className="text-muted" style={{ padding: 24, textAlign: 'center' }}>加载 Typst 编译器…</div>}>
            <TypstBody code={post.content} />
          </Suspense>
        ) : (
          <div className="prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children, ...props }: any) => <h1 id={headingId(String(children))} {...props}>{children}</h1>,
                h2: ({ children, ...props }: any) => <h2 id={headingId(String(children))} {...props}>{children}</h2>,
                h3: ({ children, ...props }: any) => <h3 id={headingId(String(children))} {...props}>{children}</h3>,
                code({ className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const code = String(children).replace(/\n$/, '');
                  if (match) {
                    return <CodeBlock language={match[1]} code={code} isDark={isDark} />;
                  }
                  return <code className={className} {...props}>{children}</code>;
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid var(--bd)', margin: '40px 0 28px' }} />
        <CommentList comments={comments} replyTarget={replyTarget} onReplyClick={onReplyClick} />
        <CommentForm postId={post.id} onCommentAdded={loadComments} replyTarget={replyTarget} onCancelReply={() => setReplyTarget(null)} />
      </article>

      <div className="article-sidebar">
        <TableOfContents content={post.content} />
      </div>
    </div>
  );
}
