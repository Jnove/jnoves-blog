"""文章路由：公开只读，Admin 可写"""
import re

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..core.security import get_current_admin
from ..database import get_db
from ..models import Blog, Tag, User
from ..schemas.post import PostCreate, PostUpdate, PostResponse, PostSummary, PostList, TagResponse

router = APIRouter(prefix="/api/posts", tags=["posts"])


def _slugify(text: str) -> str:
    """简单 URL slug 生成（无外部依赖）"""
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
    return PostResponse.model_validate({
        "id": blog.id,
        "title": blog.title,
        "slug": blog.slug,
        "content": blog.content,
        "format": blog.format,
        "published": blog.published,
        "author_id": blog.author_id,
        "summary": blog.summary,
        "cover_image": blog.cover_image,
        "tags": [TagResponse.model_validate(t) for t in blog.tags],
        "created_at": blog.created_at,
        "updated_at": blog.updated_at,
        "comment_count": len(blog.comments),
        "like_count": len(blog.likes),
        "views": blog.views,
    })


def _strip_markdown(text: str, max_len: int = 200) -> str:
    """简单去除 Markdown 标记，截取前 N 字符作为摘要"""
    # 去掉标题、粗斜体、链接、图片、代码块等
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


def _reading_time(text: str) -> int:
    """估算阅读时间，中文 ~350 字/分钟，最少 1 分钟"""
    # 去除空白后统计有效字符
    chars = len(re.sub(r'\s+', '', text))
    return max(1, round(chars / 350))


def _post_to_summary(blog: Blog) -> PostSummary:
    return PostSummary.model_validate({
        "id": blog.id,
        "title": blog.title,
        "slug": blog.slug,
        "published": blog.published,
        "format": blog.format,
        "summary": blog.summary,
        "cover_image": blog.cover_image,
        "excerpt": _strip_markdown(blog.content, 180),
        "reading_time": _reading_time(blog.content),
        "tags": [TagResponse.model_validate(t) for t in blog.tags],
        "created_at": blog.created_at,
        "updated_at": blog.updated_at,
        "comment_count": len(blog.comments),
        "like_count": len(blog.likes),
        "views": blog.views,
    })


# ---- 公开端点 ----

@router.get("/archive")
def archive_posts(db: Session = Depends(get_db)):
    """文章归档：按年月分组，返回分组列表"""
    posts = (
        db.query(Blog)
        .filter(Blog.published == True)
        .order_by(Blog.created_at.desc())
        .all()
    )

    groups: dict[str, list] = {}
    for blog in posts:
        key = blog.created_at.strftime("%Y-%m")
        if key not in groups:
            groups[key] = []
        groups[key].append(_post_to_summary(blog))

    # 转为按时间倒序的列表
    result = []
    for key in sorted(groups.keys(), reverse=True):
        year, month = key.split("-")
        result.append({
            "year": int(year),
            "month": int(month),
            "label": f"{year}年{int(month)}月",
            "count": len(groups[key]),
            "posts": groups[key],
        })

    return result


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
    blog.views += 1
    db.commit()
    return _post_to_response(blog)


@router.get("/{slug}/related", response_model=list[PostSummary])
def related_posts(slug: str, db: Session = Depends(get_db)):
    """根据标签重叠度推荐相关文章，最多 4 篇"""
    blog = db.query(Blog).filter(Blog.slug == slug, Blog.published == True).first()
    if not blog:
        return []

    tag_ids = [t.id for t in blog.tags]
    if not tag_ids:
        return []

    # 找到有相同标签的已发布文章，排除自身
    from sqlalchemy import func
    related = (
        db.query(Blog, func.count(Blog.id).label("overlap"))
        .join(Blog.tags)
        .filter(
            Blog.published == True,
            Blog.id != blog.id,
            Tag.id.in_(tag_ids),
        )
        .group_by(Blog.id)
        .order_by(func.count(Blog.id).desc(), Blog.created_at.desc())
        .limit(4)
        .all()
    )

    return [_post_to_summary(b) for b, _ in related]


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
