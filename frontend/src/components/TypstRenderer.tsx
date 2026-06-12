import { useEffect, useState } from 'react';

interface Props {
  code: string;
}

export default function TypstRenderer({ code }: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setSvg(null);

    async function render() {
      try {
        const { $typst } = await import('@myriaddreamin/typst.ts');

        // 重置编译器状态后添加源码并渲染
        ($typst as any).cc?.reset?.();
        await ($typst as any).addSource('/main.typ', code);
        const result = await ($typst as any).svg({ mainFilePath: '/main.typ' });

        if (!cancelled) {
          setSvg(typeof result === 'string' ? result : String(result));
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Typst 编译失败');
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [code]);

  if (error) {
    return (
      <div style={{ background: 'var(--surf2)', border: '1px solid var(--bd)', borderRadius: '8px', padding: '14px 18px', margin: '1.5em 0', fontSize: '13px', color: '#c0392b' }}>
        <strong>Typst 渲染失败</strong>
        <pre style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap', fontSize: '12px', fontFamily: 'ui-monospace, monospace' }}>{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div style={{ background: 'var(--surf2)', border: '1px solid var(--bd)', borderRadius: '8px', padding: '24px', margin: '1.5em 0', textAlign: 'center', color: 'var(--txt2)', fontSize: '13px' }}>
        编译 Typst…
      </div>
    );
  }

  return (
    <div
      style={{ margin: '1.5em 0', maxWidth: '100%', overflowX: 'auto', border: '1px solid var(--bd)', borderRadius: '8px', background: '#fff', padding: '12px' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
