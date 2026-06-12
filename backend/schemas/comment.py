from datetime import datetime
from pydantic import BaseModel


class CommentCreate(BaseModel):
    post_id: int
    content: str
    parent_id: int | None = None
    quote: str | None = None


class CommentResponse(BaseModel):
    id: int
    author_name: str
    content: str
    blog_id: int
    user_id: int | None = None
    parent_id: int | None = None
    quote: str | None = None
    replies: list["CommentResponse"] = []
    created_at: datetime

    model_config = {"from_attributes": True}
