import { useEffect, useState } from 'react';
import { postsApi, tagsApi } from '../api/client';
import PostCard from '../components/PostCard';
import type { PostSummary, Tag } from '../types';

export default function Home() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTag, setActiveTag] = useState<string | undefined>();

  useEffect(() => {
    postsApi.list(1, activeTag).then(data => setPosts(data.items));
    tagsApi.list().then(setTags);
  }, [activeTag]);

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTag(undefined)}
          style={{
            padding: '4px 12px', borderRadius: '16px', border: '1px solid var(--border)',
            background: !activeTag ? 'var(--accent-bg)' : 'transparent',
            cursor: 'pointer', fontSize: '14px',
          }}
        >
          All
        </button>
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => setActiveTag(tag.slug)}
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
        <p>No posts yet.</p>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
