"""点赞路由：登录用户可点赞/取消，公开可查数量"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..core.security import get_current_user, get_optional_current_user
from ..database import get_db
from ..models import Blog, Like, User

router = APIRouter(prefix="/api/likes", tags=["likes"])


class LikeRequest(BaseModel):
    blog_id: int


@router.post("")
def like_post(
    body: LikeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    blog = db.query(Blog).filter(Blog.id == body.blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="文章不存在")
    existing = db.query(Like).filter(
        Like.user_id == current_user.id, Like.blog_id == body.blog_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="已经点过赞了")
    like = Like(user_id=current_user.id, blog_id=body.blog_id)
    db.add(like)
    db.commit()
    like_count = db.query(Like).filter(Like.blog_id == body.blog_id).count()
    return {"liked": True, "like_count": like_count}


@router.delete("/{blog_id}")
def unlike_post(
    blog_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(Like).filter(
        Like.user_id == current_user.id, Like.blog_id == blog_id
    ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="未点赞")
    db.delete(existing)
    db.commit()
    like_count = db.query(Like).filter(Like.blog_id == blog_id).count()
    return {"liked": False, "like_count": like_count}


@router.get("/{blog_id}")
def check_liked(
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
    return {"liked": liked, "like_count": like_count}
