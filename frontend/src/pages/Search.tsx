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
      <div className="search-wrap">
        <input
          className="search-input"
          placeholder="搜索文章…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>搜索</button>
      </div>
      {q && results.length === 0 && (
        <p className="text-muted">未找到与 &quot;{q}&quot; 相关的文章。</p>
      )}
      {results.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  );
}
