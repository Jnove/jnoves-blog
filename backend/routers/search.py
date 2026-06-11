"""搜索路由：全文搜索文章标题和内容"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Blog
from ..schemas.post import PostSummary

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=list[PostSummary])
def search_posts(
    q: str = Query(..., min_length=1, description="搜索关键词"),
    db: Session = Depends(get_db),
):
    pattern = f"%{q}%"
    blogs = (
        db.query(Blog)
        .filter(
            Blog.published == True,
            (Blog.title.ilike(pattern)) | (Blog.content.ilike(pattern))
        )
        .order_by(Blog.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        PostSummary(
            id=b.id, title=b.title, slug=b.slug, published=b.published,
            tags=[{"id": t.id, "name": t.name, "slug": t.slug} for t in b.tags],
            created_at=b.created_at, updated_at=b.updated_at,
            comment_count=len(b.comments), like_count=len(b.likes), views=b.views,
        )
        for b in blogs
    ]
