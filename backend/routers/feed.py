"""RSS 2.0 订阅源，让读者通过 RSS 阅读器订阅博客"""
import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Blog

router = APIRouter(prefix="/api/feed", tags=["feed"])

BLOG_TITLE = "Jnove's Blog"
BLOG_DESCRIPTION = "技术在于积累，思考在于沉淀 — 个人技术博客"
BLOG_LINK = "https://jnove.me"


def _escape_xml(text: str) -> str:
    """转义 XML 特殊字符"""
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    text = text.replace('"', "&quot;")
    text = text.replace("'", "&apos;")
    return text


def _safe_cdata(content: str) -> str:
    """安全包裹 CDATA：如果内容包含 ]]> 则拆分为多段"""
    if "]]>" in content:
        parts = content.split("]]>")
        return "<![CDATA[" + "]]]]><![CDATA[>".join(parts) + "]]>"
    return f"<![CDATA[{content}]]>"


def _rfc822_date(dt) -> str:
    """将 datetime 转为 RFC 822 格式（RSS 2.0 要求）"""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.strftime("%a, %d %b %Y %H:%M:%S %z")


@router.get("/rss")
def rss_feed(db: Session = Depends(get_db)):
    """RSS 2.0 订阅源"""
    posts = (
        db.query(Blog)
        .filter(Blog.published == True)
        .order_by(Blog.created_at.desc())
        .limit(50)
        .all()
    )

    if not posts:
        now_rfc822 = _rfc822_date(datetime.now(timezone.utc))
        rss_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>{BLOG_TITLE}</title>
    <link>{BLOG_LINK}</link>
    <description>{BLOG_DESCRIPTION}</description>
    <language>zh-CN</language>
    <lastBuildDate>{now_rfc822}</lastBuildDate>
    <atom:link href="{BLOG_LINK}/api/feed/rss" rel="self" type="application/rss+xml"/>
  </channel>
</rss>"""
        return Response(content=rss_xml, media_type="application/rss+xml; charset=utf-8")

    items_xml = []
    for post in posts:
        title = _escape_xml(post.title)
        link = f"{BLOG_LINK}/post/{post.slug}"
        pub_date = _rfc822_date(post.created_at)
        summary = post.summary or ""
        if not summary:
            # 截取正文前 300 字符作为 description
            plain = re.sub(r'<[^>]+>', '', post.content or "")
            plain = re.sub(r'\s+', ' ', plain).strip()
            summary = plain[:300] + ("…" if len(plain) > 300 else "")
        description = _escape_xml(summary)

        categories = ""
        for tag in post.tags:
            categories += f"      <category>{_escape_xml(tag.name)}</category>\n"

        items_xml.append(
            "    <item>\n"
            f"      <title>{title}</title>\n"
            f"      <link>{link}</link>\n"
            f"      <guid isPermaLink=\"true\">{link}</guid>\n"
            f"      <pubDate>{pub_date}</pubDate>\n"
            f"      <description>{description}</description>\n"
            f"      <content:encoded>{_safe_cdata(post.content)}</content:encoded>\n"
            f"{categories}"
            "    </item>"
        )

    now_rfc822 = _rfc822_date(posts[0].updated_at)

    rss_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>{BLOG_TITLE}</title>
    <link>{BLOG_LINK}</link>
    <description>{BLOG_DESCRIPTION}</description>
    <language>zh-CN</language>
    <lastBuildDate>{now_rfc822}</lastBuildDate>
    <atom:link href="{BLOG_LINK}/api/feed/rss" rel="self" type="application/rss+xml"/>
{chr(10).join(items_xml)}
  </channel>
</rss>"""

    return Response(content=rss_xml, media_type="application/rss+xml; charset=utf-8")
