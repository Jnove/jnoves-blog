import { useEffect, useRef, useState } from 'react';
import { postsApi, tagsApi } from '../api/client';
import PostCard from '../components/PostCard';
import type { PostSummary, Tag } from '../types';

// 打字机 slogans，按喜好修改 
const SLOGANS = [
  '技术在于积累，思考在于沉淀',
  '把知识写下来，才算真正学会',
  'Code. Think. Write.',
  '记录每一个值得记录的瞬间',
];

// 打字机 Hook 
function useTypewriter(phrases: string[], typeSpeed = 76, deleteSpeed = 38) {
  const [displayed, setDisplayed] = useState('');
  const state = useRef({ idx: 0, charIdx: 0, deleting: false });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const { idx, charIdx, deleting } = state.current;
      const phrase = phrases[idx];

      if (!deleting) {
        const next = charIdx + 1;
        setDisplayed(phrase.slice(0, next));
        state.current.charIdx = next;
        if (next >= phrase.length) {
          state.current.deleting = true;
          timer = setTimeout(tick, 2400);   // 停顿后再删
          return;
        }
      } else {
        const next = charIdx - 1;
        setDisplayed(phrase.slice(0, next));
        state.current.charIdx = next;
        if (next <= 0) {
          state.current.deleting = false;
          state.current.idx = (idx + 1) % phrases.length;
          timer = setTimeout(tick, 500);    // 停顿后再打
          return;
        }
      }

      timer = setTimeout(tick, deleting ? deleteSpeed : typeSpeed);
    };

    timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return displayed;
}

// Component 
const PAGE_SIZE = 10;

export default function Home() {
  const slogan = useTypewriter(SLOGANS);

  const [posts, setPosts]       = useState<PostSummary[]>([]);
  const [tags, setTags]         = useState<Tag[]>([]);
  const [activeTag, setActiveTag] = useState<string | undefined>();
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { tagsApi.list().then(setTags); }, []);

  useEffect(() => {
    setLoading(true);
    postsApi.list(page, activeTag)
      .then(data => { setPosts(data.items); setTotal(data.total); })
      .finally(() => setLoading(false));
  }, [page, activeTag]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleTag = (slug?: string) => {
    setActiveTag(slug);
    setPage(1);
  };

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div className="hero-title">
          Jnove<span className="acc">'s</span> blog
        </div>
        <div className="hero-slogan">
          <span>{slogan}</span>
          <span className="typer-cursor" aria-hidden="true" />
        </div>
      </div>

      <div className="divider" />

      {/* Tag filter */}
      <div className="tag-bar">
        <button
          className={`tag-pill${!activeTag ? ' active' : ''}`}
          onClick={() => handleTag(undefined)}
        >
          全部
        </button>
        {tags.map(tag => (
          <button
            key={tag.id}
            className={`tag-pill${activeTag === tag.slug ? ' active' : ''}`}
            onClick={() => handleTag(tag.slug)}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {/* Post list */}
      {loading ? (
        <p className="text-muted">加载中…</p>
      ) : posts.length === 0 ? (
        <p className="text-muted">暂无文章</p>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} />)
      )}

      {/* Pagination*/}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-ghost"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            上一页
          </button>
          <span className="page-info">第 {page} / {totalPages} 页</span>
          <button
            className="btn btn-ghost"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            下一页
          </button>
        </div>
      )}
    </>
  );
}
