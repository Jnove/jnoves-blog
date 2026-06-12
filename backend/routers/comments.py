"""评论路由：公开可读，登录用户可发，支持嵌套回复和引用"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..core.security import get_current_user
from ..database import get_db
from ..models import Blog, Comment, User
from ..schemas.comment import CommentCreate, CommentResponse

router = APIRouter(prefix="/api/comments", tags=["comments"])


def _comment_to_response(c: Comment) -> CommentResponse:
    return CommentResponse(
        id=c.id,
        author_name=c.author_name,
        content=c.content,
        blog_id=c.blog_id,
        user_id=c.user_id,
        parent_id=c.parent_id,
        quote=c.quote,
        replies=[_comment_to_response(r) for r in (c.replies or [])],
        created_at=c.created_at,
    )


@router.get("", response_model=list[CommentResponse])
def list_comments(
    post_id: int = Query(..., description="文章ID"),
    db: Session = Depends(get_db),
):
    blog = db.query(Blog).filter(Blog.id == post_id, Blog.published == True).first()
    if not blog:
        raise HTTPException(status_code=404, detail="文章不存在")
    # 只返回顶级评论，replies 通过 relationship 自动加载
    comments = (
        db.query(Comment)
        .filter(Comment.blog_id == post_id, Comment.parent_id == None)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return [_comment_to_response(c) for c in comments]


@router.post("", response_model=CommentResponse, status_code=201)
def create_comment(
    body: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    blog = db.query(Blog).filter(Blog.id == body.post_id, Blog.published == True).first()
    if not blog:
        raise HTTPException(status_code=404, detail="文章不存在")

    # 如果是回复，检查父评论存在且属于同一文章
    if body.parent_id:
        parent = db.query(Comment).filter(Comment.id == body.parent_id, Comment.blog_id == body.post_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="父评论不存在")

    comment = Comment(
        content=body.content,
        author_name=current_user.username,
        author_email=current_user.email,
        blog_id=body.post_id,
        user_id=current_user.id,
        parent_id=body.parent_id,
        quote=body.quote,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return _comment_to_response(comment)
