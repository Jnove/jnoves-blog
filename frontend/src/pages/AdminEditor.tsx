import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { postsApi, uploadApi } from '../api/client';
import CodeBlock from '../components/CodeBlock';
import { useIsDark } from '../hooks/useIsDark';

export default function AdminEditor() {
  const [searchParams] = useSearchParams();
  const editSlug = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [published, setPublished] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);
  const [format, setFormat] = useState<'markdown' | 'typst'>('markdown');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isDark = useIsDark();

  useEffect(() => {
    if (editSlug) {
      postsApi.get(editSlug).then(post => {
        setTitle(post.title);
        setSlug(post.slug);
        setContent(post.content);
        setTags(post.tags.map(t => t.name).join(', '));
        setSummary(post.summary || '');
        setCoverImage(post.cover_image || '');
        setFormat((post.format as 'markdown' | 'typst') || 'markdown');
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
      format,
      summary: summary || undefined,
      cover_image: coverImage || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      published,
    };
    try {
      if (editSlug) {
        await postsApi.update(editSlug, data);
        setMessage('文章已更新！');
      } else {
        await postsApi.create(data);
        setMessage('文章已发布！');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知错误';
      setMessage('错误：' + msg);
    }
  }

  async function handleDelete() {
    if (!editSlug) return;
    if (!confirm('确定要删除这篇文章吗？此操作无法撤销。')) return;
    try {
      await postsApi.delete(editSlug);
      window.location.href = '/admin';
    } catch { /* ignore */ }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadApi.upload(file);
      setCoverImage(res.url);
    } catch {
      setMessage('图片上传失败');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="form-title">{editSlug ? '编辑文章' : '新建文章'}</h1>
      {message && (
        <p style={{ padding: '8px 14px', marginBottom: '16px', background: 'var(--acc-bg)', borderRadius: '7px', color: 'var(--acc-tx)', fontSize: '14px' }}>
          {message}
        </p>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
        <button type="button" className={`btn${!preview ? ' btn-primary' : ' btn-ghost'}`} onClick={() => setPreview(false)} style={{ fontSize: '13px' }}>编辑</button>
        <button type="button" className={`btn${preview ? ' btn-primary' : ' btn-ghost'}`} onClick={() => setPreview(true)} style={{ fontSize: '13px' }}>预览</button>
        <span style={{ flex: 1 }} />
        <label style={{ fontSize: '13px', color: 'var(--txt2)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          渲染格式
          <select
            value={format}
            onChange={e => setFormat(e.target.value as 'markdown' | 'typst')}
            style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid var(--bd)', background: 'var(--surf)', color: 'var(--txt)', fontSize: '13px', cursor: 'pointer' }}
          >
            <option value="markdown">Markdown</option>
            <option value="typst">Typst</option>
          </select>
        </label>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <input className="form-input" placeholder="文章标题" value={title} onChange={e => setTitle(e.target.value)} required style={{ fontSize: '18px' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
          <input className="form-input" placeholder="URL 别名 (slug)" value={slug} onChange={e => setSlug(e.target.value)} required />
          <input className="form-input" placeholder="标签（逗号分隔）" value={tags} onChange={e => setTags(e.target.value)} />
        </div>

        {/* Summary */}
        <div className="form-field">
          <input className="form-input" placeholder="一句话总结（可选，列表页展示）" value={summary} onChange={e => setSummary(e.target.value)} maxLength={300} />
        </div>

        {/* Cover image */}
        <div className="form-field" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input className="form-input" placeholder="封面图 URL（可选）" value={coverImage} onChange={e => setCoverImage(e.target.value)} style={{ flex: 1 }} />
          <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
          <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
            {uploading ? '上传中…' : '上传图片'}
          </button>
        </div>
        {coverImage && (
          <div style={{ marginBottom: '14px', position: 'relative', display: 'inline-block' }}>
            <img src={coverImage} alt="封面预览" style={{ maxHeight: 120, borderRadius: '7px', border: '1px solid var(--bd)' }} />
            <button type="button" onClick={() => setCoverImage('')} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', border: '1px solid var(--bd)', background: 'var(--surf)', cursor: 'pointer', fontSize: 12, lineHeight: '18px', textAlign: 'center' }}>x</button>
          </div>
        )}

        {preview ? (
          <div className="prose" style={{ minHeight: 300, border: '1px solid var(--bd)', borderRadius: '7px', padding: '16px 20px', marginBottom: '14px' }}>
            {coverImage && <img src={coverImage} alt="" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: '7px', marginBottom: '16px' }} />}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
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
              {content || '*（暂无内容）*'}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="form-field">
            <textarea className="form-textarea" placeholder="正文（Markdown / Typst）" value={content} onChange={e => setContent(e.target.value)} required rows={20} style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '14px' }} />
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
          <label style={{ fontSize: '14px', color: 'var(--txt)', cursor: 'pointer' }}>
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
            {' '}公开发布
          </label>
          <button type="submit" className="btn btn-primary">
            {editSlug ? '更新' : '发布'}
          </button>
          {editSlug && (
            <button type="button" className="btn btn-ghost" onClick={handleDelete} style={{ color: '#c0392b', borderColor: '#c0392b' }}>
              删除文章
            </button>
          )}
        </div>
      </form>
      <p style={{ marginTop: '20px' }}><Link to="/admin" className="inline-link">← 返回仪表盘</Link></p>
    </div>
  );
}
