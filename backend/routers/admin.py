"""管理后台路由：仪表盘统计数据"""
from fastapi import APIRouter, Depends
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
