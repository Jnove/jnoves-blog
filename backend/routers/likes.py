"""点赞路由：登录用户/游客均可点赞，可查看数量"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.security import get_optional_current_user
from ..database import get_db
from ..models import Blog, Like, User

router = APIRouter(prefix="/api/likes", tags=["likes"])


class LikeRequest(BaseModel):
    blog_id: int


def _get_client_ip(request: Request) -> str:
    """从请求中获取客户端 IP（优先 X-Forwarded-For）"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _existing_like(
    db: Session, blog_id: int, user: User | None, ip: str
) -> Like | None:
    """按用户 ID 或 IP 查找已有点赞"""
    if user:
        return db.query(Like).filter(
            Like.user_id == user.id, Like.blog_id == blog_id
        ).first()
    return db.query(Like).filter(
        Like.ip_address == ip, Like.blog_id == blog_id,
        Like.user_id.is_(None)
    ).first()


@router.post("")
def like_post(
    request: Request,
    body: LikeRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    blog = db.query(Blog).filter(Blog.id == body.blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="文章不存在")
    ip = _get_client_ip(request)
    existing = _existing_like(db, body.blog_id, current_user, ip)
    if existing:
        raise HTTPException(status_code=409, detail="已经点过赞了")
    like = Like(
        user_id=current_user.id if current_user else None,
        ip_address=None if current_user else ip,
        blog_id=body.blog_id,
    )
    db.add(like)
    db.commit()
    like_count = db.query(Like).filter(Like.blog_id == body.blog_id).count()
    return {"liked": True, "like_count": like_count}


@router.delete("/{blog_id}")
def unlike_post(
    request: Request,
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    ip = _get_client_ip(request)
    existing = _existing_like(db, blog_id, current_user, ip)
    if not existing:
        raise HTTPException(status_code=404, detail="未点赞")
    db.delete(existing)
    db.commit()
    like_count = db.query(Like).filter(Like.blog_id == blog_id).count()
    return {"liked": False, "like_count": like_count}


@router.get("/{blog_id}")
def check_liked(
    request: Request,
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    like_count = db.query(Like).filter(Like.blog_id == blog_id).count()
    liked = False
    if current_user:
        liked = db.query(Like).filter(
            Like.user_id == current_user.id, Like.blog_id == blog_id
        ).first() is not None
    else:
        ip = _get_client_ip(request)
        liked = db.query(Like).filter(
            Like.ip_address == ip, Like.blog_id == blog_id,
            Like.user_id.is_(None)
        ).first() is not None
    return {"liked": liked, "like_count": like_count}
