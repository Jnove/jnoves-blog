import { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { postsApi } from '../api/client';

export default function AdminEditor() {
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (editSlug) {
      postsApi.get(editSlug).then(post => {
        setTitle(post.title);
        setSlug(post.slug);
        setContent(post.content);
        setTags(post.tags.map(t => t.name).join(', '));
        setPublished(post.published);
      });
    }
  }, [editSlug]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = {
      title,
      slug,
      content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      published,
    };
    try {
      if (editSlug) {
        await postsApi.update(editSlug, data);
        setMessage('Article updated!');
      } else {
        await postsApi.create(data);
        setMessage('Article published!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setMessage(`Error: ${msg}`);
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>{editSlug ? 'Edit Article' : 'New Article'}</h1>
      {message && <p style={{ padding: '8px', background: 'var(--accent-bg)', borderRadius: '4px' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <input
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', boxSizing: 'border-box', fontSize: '18px' }}
          />
        </div>
        <div style={{ marginBottom: '12px', display: 'flex', gap: '12px' }}>
          <input
            placeholder="slug"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            required
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
          />
          <input
            placeholder="tags (comma separated)"
            value={tags}
            onChange={e => setTags(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <textarea
            placeholder="Content (Markdown / Typst)"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={20}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
          <label>
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
            {' '}Published
          </label>
          <button type="submit" style={{ padding: '8px 24px', cursor: 'pointer' }}>
            {editSlug ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
      <p><Link to="/">← Back to home</Link></p>
    </div>
  );
}
