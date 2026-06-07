from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, ForeignKey,
    UniqueConstraint, Index, DateTime
)
from sqlalchemy.orm import relationship

from .database import Base


# 通用混入
class TimestampMixin:
    """自动管理创建和更新时间（UTC时间）的混入类"""
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="创建时间"
    )
    updated_at = Column(
        DateTime(timezone=True), #UTC 时间
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="最后更新时间"
    )


# 用户 
class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False, comment="用户名")
    email = Column(String(255), unique=True, index=True, nullable=False, comment="邮箱")
    password_hash = Column(String(255), nullable=False, comment="加密后的密码")

    # 关联关系：一个用户可发表多篇博客、多条评论、多次点赞
    blogs = relationship(
        "Blog", back_populates="author",
        cascade="all, delete-orphan", lazy="select"
    )
    comments = relationship(
        "Comment", back_populates="user",
        cascade="all, delete-orphan", lazy="select"
    )
    likes = relationship(
        "Like", back_populates="user",
        cascade="all, delete-orphan", lazy="select"
    )

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username!r})>"


# 博客
class Blog(Base, TimestampMixin):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, comment="博客标题")
    content = Column(Text, nullable=False, comment="博客正文")
    author_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="作者ID"
    )

    # 关联关系
    author = relationship("User", back_populates="blogs", lazy="select")
    comments = relationship(
        "Comment", back_populates="blog",
        cascade="all, delete-orphan", lazy="select"
    )
    likes = relationship(
        "Like", back_populates="blog",
        cascade="all, delete-orphan", lazy="select"
    )

    def __repr__(self):
        return f"<Blog(id={self.id}, title={self.title!r})>"


# 评论
class Comment(Base, TimestampMixin):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False, comment="评论内容")
    blog_id = Column(
        Integer,
        ForeignKey("blogs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="被评论的博客ID"
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="评论者ID"
    )

    # 关联关系
    blog = relationship("Blog", back_populates="comments", lazy="select")
    user = relationship("User", back_populates="comments", lazy="select")

    def __repr__(self):
        return f"<Comment(id={self.id}, blog_id={self.blog_id}, user_id={self.user_id})>"


# 点赞（显式关联实体）
class Like(Base, TimestampMixin):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        comment="点赞用户ID"
    )
    blog_id = Column(
        Integer,
        ForeignKey("blogs.id", ondelete="CASCADE"),
        nullable=False,
        comment="被点赞博客ID"
    )

    # 关联关系
    user = relationship("User", back_populates="likes", lazy="select")
    blog = relationship("Blog", back_populates="likes", lazy="select")

    # 联合唯一约束：同一用户对同一博客只能点赞一次
    __table_args__ = (
        UniqueConstraint("user_id", "blog_id", name="uq_user_blog_like"),
        Index("ix_likes_user_id", "user_id"),
        Index("ix_likes_blog_id", "blog_id"),
    )

    def __repr__(self):
        return f"<Like(user_id={self.user_id}, blog_id={self.blog_id})>"