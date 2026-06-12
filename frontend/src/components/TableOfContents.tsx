import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

/** 从 Markdown 内容中提取标题，生成目录 */
export function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/[`*_~\[\]()]/g, '').trim();
    const id = text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w一-鿿-]/g, '');
    items.push({ id, text, level });
  }
  return items;
}

interface Props {
  content: string;
}

export default function TableOfContents({ content }: Props) {
  const items = extractToc(content);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (items.length === 0) return;

    function handleScroll() {
      const headings = items
        .map(item => document.getElementById(item.id))
        .filter(Boolean) as HTMLElement[];
      
      let current = '';
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= 100) {
          current = h.id;
        }
      }
      setActiveId(current);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="toc-sidebar">
      <div className="toc-sidebar-title">目录</div>
      {items.map(item => (
        <a
          key={item.id}
          href={'#' + item.id}
          className={'toc-link toc-link-h' + item.level + (activeId === item.id ? ' active' : '')}
          onClick={e => {
            e.preventDefault();
            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {item.text}
        </a>
      ))}
    </nav>
  );
}
