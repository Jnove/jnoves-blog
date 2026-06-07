import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchApi } from '../api/client';
import PostCard from '../components/PostCard';
import type { PostSummary } from '../types';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<PostSummary[]>([]);
  const [input, setInput] = useState(q);

  useEffect(() => {
    if (q) searchApi.search(q).then(setResults);
  }, [q]);

  function handleSearch() {
    setSearchParams({ q: input });
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input
          placeholder="搜索文章…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '16px' }}
        />
        <button onClick={handleSearch} style={{ padding: '8px 24px', cursor: 'pointer' }}>搜索</button>
      </div>
      {q && results.length === 0 && <p>未找到与 &quot;{q}&quot; 相关的文章。</p>}
      {results.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
