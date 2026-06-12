export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">Jnove<span className="acc">'s</span> blog</span>
          <p className="footer-tagline">技术在于积累，思考在于沉淀</p>
        </div>
        <div className="footer-links">
          <a href="/" className="footer-link">首页</a>
          <a href="/archive" className="footer-link">归档</a>
          <a href="/about" className="footer-link">关于</a>
          <a href="/search" className="footer-link">搜索</a>
          <a href="/api/feed/rss" className="footer-link" title="复制此链接到 RSS 阅读器即可订阅博客更新">RSS 订阅</a>
        </div>
        <div className="footer-copy">
          <p>Built with FastAPI + React</p>
          <p className="footer-year">&copy; {new Date().getFullYear()} Jnove</p>
        </div>
      </div>
    </footer>
  );
}
