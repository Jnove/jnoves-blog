from datetime import datetime
from pydantic import BaseModel, Field
from .tag import TagResponse


class PostCreate(BaseModel):
    title: str = Field(..., max_length=200)
    content: str
    slug: str = Field(..., max_length=250)
    format: str = "markdown"
    summary: str | None = None
    cover_image: str | None = None
    tags: list[str] = Field(default_factory=list)
    published: bool = False


class PostUpdate(BaseModel):
    title: str | None = Field(None, max_length=200)
    content: str | None = None
    slug: str | None = Field(None, max_length=250)
    format: str | None = None
    summary: str | None = None
    cover_image: str | None = None
    tags: list[str] | None = None
    published: bool | None = None


class PostSummary(BaseModel):
    id: int
    title: str
    slug: str
    published: bool
    format: str = "markdown"
    summary: str | None = None
    cover_image: str | None = None
    excerpt: str = ""
    reading_time: int = 1
    tags: list[TagResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    comment_count: int = 0
    like_count: int = 0
    views: int = 0

    model_config = {"from_attributes": True}


class PostResponse(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    format: str = "markdown"
    published: bool
    author_id: int
    summary: str | None = None
    cover_image: str | None = None
    tags: list[TagResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    comment_count: int = 0
    like_count: int = 0
    views: int = 0

    model_config = {"from_attributes": True}


class PostList(BaseModel):
    items: list[PostSummary]
    total: int
