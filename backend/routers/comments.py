"""评论路由：公开可读，任何人可发"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Blog, Comment
from ..schemas.comment import CommentCreate, CommentResponse

router = APIRouter(prefix="/api/comments", tags=["comments"])


@router.get("", response_model=list[CommentResponse])
def list_comments(
    post_id: int = Query(..., description="文章ID"),
    db: Session = Depends(get_db),
):
    blog = db.query(Blog).filter(Blog.id == post_id, Blog.published == True).first()
    if not blog:
        raise HTTPException(status_code=404, detail="文章不存在")
    comments = (
        db.query(Comment)
        .filter(Comment.blog_id == post_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return comments


@router.post("", response_model=CommentResponse, status_code=201)
def create_comment(body: CommentCreate, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.id == body.post_id, Blog.published == True).first()
    if not blog:
        raise HTTPException(status_code=404, detail="文章不存在")
    comment = Comment(
        content=body.content,
        author_name=body.author_name,
        author_email=body.author_email,
        blog_id=body.post_id,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
