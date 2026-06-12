import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { aboutApi } from '../api/client';
import CodeBlock from '../components/CodeBlock';
import { useIsDark } from '../hooks/useIsDark';

export default function About() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const isDark = useIsDark();

  useEffect(() => {
    aboutApi.get()
      .then(data => setContent(data.content))
      .catch(() => setContent(''))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted" style={{ padding: '24px 0' }}>加载中…</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="form-title">关于</h1>
      {content ? (
        <div className="prose">
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
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-muted" style={{ lineHeight: 1.8 }}>
          个人技术博客，记录技术文章、笔记与随笔。
        </p>
      )}
    </div>
  );
}
