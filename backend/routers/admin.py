"""管理后台路由：仪表盘统计数据 + 评论管理"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..core.security import get_current_admin
from ..database import get_db
from ..models import Blog, Comment, Tag, User

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    total_views = db.query(func.sum(Blog.views)).scalar() or 0
    return {
        "post_count": db.query(Blog).count(),
        "published_count": db.query(Blog).filter(Blog.published == True).count(),
        "comment_count": db.query(Comment).count(),
        "tag_count": db.query(Tag).count(),
        "total_views": total_views,
    }


# ---------- 评论管理 ----------

class AdminCommentResponse(BaseModel):
    id: int
    author_name: str
    content: str
    blog_id: int
    blog_title: str
    blog_slug: str
    user_id: int | None = None
    created_at: str

    model_config = {"from_attributes": True}


class AdminCommentList(BaseModel):
    items: list[AdminCommentResponse]
    total: int


@router.get("/comments", response_model=AdminCommentList)
def admin_list_comments(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    query = db.query(Comment).order_by(Comment.created_at.desc())
    total = query.count()
    comments = query.offset((page - 1) * size).limit(size).all()
    items = []
    for c in comments:
        blog = db.query(Blog).filter(Blog.id == c.blog_id).first()
        items.append(AdminCommentResponse(
            id=c.id,
            author_name=c.author_name,
            content=c.content,
            blog_id=c.blog_id,
            blog_title=blog.title if blog else "(已删除)",
            blog_slug=blog.slug if blog else "",
            user_id=c.user_id,
            created_at=c.created_at.isoformat() if c.created_at else "",
        ))
    return AdminCommentList(items=items, total=total)


@router.delete("/comments/{comment_id}", status_code=204)
def admin_delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="评论不存在")
    db.delete(comment)
    db.commit()