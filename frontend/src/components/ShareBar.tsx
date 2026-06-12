import { useState } from 'react';

interface ShareBarProps {
  title: string;
  slug: string;
}

export default function ShareBar({ title, slug }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/post/${slug}` : `/post/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: use old-style textarea copy
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`${title}`);
    const shareUrl = encodeURIComponent(url);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="share-bar">
      <span className="share-label">分享</span>
      <button className="share-btn" onClick={handleCopy} title="复制链接">
        {copied ? '✓ 已复制' : '🔗 复制链接'}
      </button>
      <button className="share-btn" onClick={shareTwitter} title="分享到 Twitter/X">
        𝕏 推文
      </button>
    </div>
  );
}
