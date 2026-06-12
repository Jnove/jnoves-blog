"""搜索路由：基于分词匹配 + 相关性排序"""
import re

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Blog
from ..schemas.post import PostSummary

router = APIRouter(prefix="/api/search", tags=["search"])


def _reading_time(text: str) -> int:
    chars = len(re.sub(r'\s+', '', text))
    return max(1, round(chars / 350))


def _strip_markdown(text: str, max_len: int = 200) -> str:
    text = re.sub(r'#{1,6}\s+', '', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'!\[.*?\]\(.*?\)', '', text)
    text = re.sub(r'\[([^\]]*)\]\(.*?\)', r'\1', text)
    text = re.sub(r'`{1,3}[^`]*`{1,3}', '', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\n+', ' ', text)
    text = text.strip()
    if len(text) > max_len:
        text = text[:max_len].rsplit(' ', 1)[0] + '…'
    return text


def _tokenize(query: str) -> list[str]:
    """将查询词按空格/逗号/句号等拆分，去除过短的 token"""
    tokens = re.split(r'[\s,，。、；;]+', query.strip())
    return [t for t in tokens if len(t) >= 1]


def _score(blog: Blog, tokens: list[str]) -> int:
    """相关性打分：标题匹配权重高，内容匹配权重低"""
    score = 0
    title_lower = blog.title.lower()
    content_lower = blog.content.lower() if blog.content else ""

    for token in tokens:
        t = token.lower()
        if t in title_lower:
            score += 3  # 标题匹配权重
        if t in content_lower:
            score += 1  # 正文匹配权重

    # 标题精确包含完整查询 → 额外加成
    full_query = " ".join(tokens).lower()
    if full_query in title_lower:
        score += 5

    return score


@router.get("", response_model=list[PostSummary])
def search_posts(
    q: str = Query(..., min_length=1, description="搜索关键词"),
    db: Session = Depends(get_db),
):
    tokens = _tokenize(q)
    if not tokens:
        return []

    # 先用 LIKE 筛选候选（宽口径），再打分排序
    conditions = []
    for token in tokens:
        p = f"%{token}%"
        conditions.append(Blog.title.ilike(p))
        conditions.append(Blog.content.ilike(p))

    from sqlalchemy import or_
    blogs = (
        db.query(Blog)
        .filter(Blog.published == True, or_(*conditions))
        .all()
    )

    # 打分 + 排序
    scored = [(b, _score(b, tokens)) for b in blogs]
    scored.sort(key=lambda x: x[1], reverse=True)

    # 只返回有匹配的结果，最多 20 条
    return [
        PostSummary(
            id=b.id, title=b.title, slug=b.slug, published=b.published,
            format=b.format or "markdown",
            summary=b.summary,
            cover_image=b.cover_image,
            excerpt=_strip_markdown(b.content, 180),
            reading_time=_reading_time(b.content),
            tags=[{"id": t.id, "name": t.name, "slug": t.slug} for t in b.tags],
            created_at=b.created_at, updated_at=b.updated_at,
            comment_count=len(b.comments), like_count=len(b.likes), views=b.views,
        )
        for b, s in scored
        if s > 0
    ][:20]
