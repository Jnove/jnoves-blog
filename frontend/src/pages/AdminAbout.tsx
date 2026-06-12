import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { aboutApi } from '../api/client';
import CodeBlock from '../components/CodeBlock';
import { useIsDark } from '../hooks/useIsDark';

export default function AdminAbout() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(false);
  const isDark = useIsDark();

  useEffect(() => {
    aboutApi.get()
      .then(data => setContent(data.content))
      .catch(() => setContent(''))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await aboutApi.update(content);
      setMessage('已保存！');
    } catch {
      setMessage('保存失败，请稍后再试。');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-muted" style={{ padding: '24px 0' }}>加载中…</p>;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 className="form-title">编辑关于页</h1>
      <p className="text-muted" style={{ fontSize: '14px', marginBottom: '16px' }}>
        支持 Markdown 语法。保存后访客将在「关于」页面看到渲染后的内容。
      </p>
      {message && (
        <p style={{ padding: '8px 14px', marginBottom: '16px', background: 'var(--acc-bg)', borderRadius: '7px', color: 'var(--acc-tx)', fontSize: '14px' }}>
          {message}
        </p>
      )}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button type="button" className={`btn${!preview ? ' btn-primary' : ' btn-ghost'}`} onClick={() => setPreview(false)} style={{ fontSize: '13px' }}>编辑</button>
        <button type="button" className={`btn${preview ? ' btn-primary' : ' btn-ghost'}`} onClick={() => setPreview(true)} style={{ fontSize: '13px' }}>预览</button>
      </div>
      <form onSubmit={handleSubmit}>
        {preview ? (
          <div className="prose" style={{ minHeight: 200, border: '1px solid var(--bd)', borderRadius: '7px', padding: '16px 20px' }}>
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
            <textarea className="form-textarea" placeholder="在这里输入关于页内容（支持 Markdown）…" value={content} onChange={e => setContent(e.target.value)} rows={15} style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '14px' }} />
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </button>
          <Link to="/admin" className="inline-link">← 返回仪表盘</Link>
        </div>
      </form>
    </div>
  );
}
