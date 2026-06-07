from datetime import datetime
from pydantic import BaseModel, Field
from .tag import TagResponse


class PostCreate(BaseModel):
    title: str = Field(..., max_length=200)
    content: str
    slug: str = Field(..., max_length=250)
    tags: list[str] = Field(default_factory=list)
    published: bool = False


class PostUpdate(BaseModel):
    title: str | None = Field(None, max_length=200)
    content: str | None = None
    slug: str | None = Field(None, max_length=250)
    tags: list[str] | None = None
    published: bool | None = None


class PostSummary(BaseModel):
    id: int
    title: str
    slug: str
    published: bool
    tags: list[TagResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    comment_count: int = 0

    model_config = {"from_attributes": True}


class PostResponse(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    published: bool
    author_id: int
    tags: list[TagResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    comment_count: int = 0

    model_config = {"from_attributes": True}


class PostList(BaseModel):
    items: list[PostSummary]
    total: int
