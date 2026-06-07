from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class CommentCreate(BaseModel):
    post_id: int
    author_name: str = Field(..., max_length=80)
    author_email: EmailStr
    content: str


class CommentResponse(BaseModel):
    id: int
    author_name: str
    content: str
    blog_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
