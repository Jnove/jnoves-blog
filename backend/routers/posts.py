"""文章路由：公开只读，Admin 可写"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..core.security import get_current_admin
from ..database import get_db
from ..models import Blog, Tag, User
from ..schemas.post import PostCreate, PostUpdate, PostResponse, PostSummary, PostList

router = APIRouter(prefix="/api/posts", tags=["posts"])


def _slugify(text: str) -> str:
    """简单 URL slug 生成（无外部依赖）"""
    import re
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text or "post"


def _get_or_create_tags(db: Session, tag_names: list[str]) -> list[Tag]:
    """根据标签名列表查找或创建 Tag 对象"""
    tags = []
    for name in tag_names:
        name = name.strip().lower()
        if not name:
            continue
        tag = db.query(Tag).filter(Tag.name == name).first()
        if not tag:
            tag = Tag(name=name, slug=_slugify(name))
            db.add(tag)
            db.flush()
        tags.append(tag)
    return tags


def _post_to_response(blog: Blog) -> PostResponse:
    return PostResponse(
        id=blog.id, title=blog.title, slug=blog.slug,
        content=blog.content, published=blog.published,
        author_id=blog.author_id,
        tags=[{"id": t.id, "name": t.name, "slug": t.slug} for t in blog.tags],
        created_at=blog.created_at, updated_at=blog.updated_at,
        comment_count=len(blog.comments),
    )


def _post_to_summary(blog: Blog) -> PostSummary:
    return PostSummary(
        id=blog.id, title=blog.title, slug=blog.slug, published=blog.published,
        tags=[{"id": t.id, "name": t.name, "slug": t.slug} for t in blog.tags],
        created_at=blog.created_at, updated_at=blog.updated_at,
        comment_count=len(blog.comments),
    )


# ---- 公开端点 ----

@router.get("", response_model=PostList)
def list_posts(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    tag: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Blog).filter(Blog.published == True)
    if tag:
        query = query.join(Blog.tags).filter(Tag.slug == tag)
    total = query.count()
    blogs = (
        query
        .order_by(Blog.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )
    items = [_post_to_summary(b) for b in blogs]
    return PostList(items=items, total=total)


@router.get("/{slug}", response_model=PostResponse)
def get_post(slug: str, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.slug == slug).first()
    if not blog:
        raise HTTPException(status_code=404, detail="文章不存在")
    return _post_to_response(blog)


# ---- Admin 端点 ----

@router.post("", response_model=PostResponse, status_code=201)
def create_post(
    body: PostCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    existing = db.query(Blog).filter(Blog.slug == body.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="该 slug 已被使用")
    tags = _get_or_create_tags(db, body.tags)
    blog = Blog(
        title=body.title,
        slug=body.slug,
        content=body.content,
        published=body.published,
        author_id=admin.id,
        tags=tags,
    )
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return _post_to_response(blog)


@router.put("/{slug}", response_model=PostResponse)
def update_post(
    slug: str,
    body: PostUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    blog = db.query(Blog).filter(Blog.slug == slug).first()
    if not blog:
        raise HTTPException(status_code=404, detail="文章不存在")
    update_data = body.model_dump(exclude_unset=True)
    tag_names = update_data.pop("tags", None)
    for key, val in update_data.items():
        setattr(blog, key, val)
    if tag_names is not None:
        blog.tags = _get_or_create_tags(db, tag_names)
    db.commit()
    db.refresh(blog)
    return _post_to_response(blog)


@router.delete("/{slug}", status_code=204)
def delete_post(
    slug: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    blog = db.query(Blog).filter(Blog.slug == slug).first()
    if not blog:
        raise HTTPException(status_code=404, detail="文章不存在")
    db.delete(blog)
    db.commit()
