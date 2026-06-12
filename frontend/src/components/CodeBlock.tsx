import { useState, Suspense, lazy } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TypstBlock = lazy(() => import('./TypstRenderer'));

interface Props {
  language: string;
  code: string;
  isDark: boolean;
}

export default function CodeBlock({ language, code, isDark }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  // Typst 专用渲染
  if (language === 'typst') {
    return (
      <div className="code-block-wrap">
        <button className="code-copy-btn" onClick={handleCopy}>
          {copied ? '已复制' : '复制'}
        </button>
        <Suspense fallback={
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--txt2)', fontSize: 13, border: '1px solid var(--bd)', borderRadius: 8 }}>
            Typst 编译器加载中…
          </div>
        }>
          <TypstBlock code={code} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="code-block-wrap">
      <button className="code-copy-btn" onClick={handleCopy}>
        {copied ? '已复制' : '复制'}
      </button>
      <SyntaxHighlighter
        style={isDark ? oneDark : oneLight}
        language={language}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
