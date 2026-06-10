import { useEffect, useState } from 'react';
import { postsApi, tagsApi } from '../api/client';
import PostCard from '../components/PostCard';
import type { PostSummary, Tag } from '../types';

const PAGE_SIZE = 10;

export default function Home() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTag, setActiveTag] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    tagsApi.list().then(setTags);
  }, []);

  useEffect(() => {
    postsApi.list(page, activeTag).then(data => {
      setPosts(data.items);
      setTotal(data.total);
    });
  }, [page, activeTag]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setActiveTag(undefined); setPage(1); }}
          style={{
            padding: '4px 12px', borderRadius: '16px', border: '1px solid var(--border)',
            background: !activeTag ? 'var(--accent-bg)' : 'transparent',
            cursor: 'pointer', fontSize: '14px',
          }}
        >
          全部
        </button>
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => { setActiveTag(tag.slug); setPage(1); }}
            style={{
              padding: '4px 12px', borderRadius: '16px', border: '1px solid var(--border)',
              background: activeTag === tag.slug ? 'var(--accent-bg)' : 'transparent',
              cursor: 'pointer', fontSize: '14px',
            }}
          >
            {tag.name}
          </button>
        ))}
      </div>
      {posts.length === 0 ? (
        <p>暂无文章</p>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} />)
      )}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px', alignItems: 'center' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            style={{
              padding: '8px 20px', borderRadius: '6px', border: '1px solid var(--border)',
              cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.5 : 1,
              background: 'var(--bg)', fontSize: '14px',
            }}
          >
            上一页
          </button>
          <span style={{ fontSize: '14px', color: 'var(--text)' }}>
            第 {page} / {totalPages} 页
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{
              padding: '8px 20px', borderRadius: '6px', border: '1px solid var(--border)',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1,
              background: 'var(--bg)', fontSize: '14px',
            }}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
