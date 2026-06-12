from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, ForeignKey, Boolean,
    Index, DateTime, Table
)
from sqlalchemy.orm import relationship

from .database import Base


# ---------- 多对多关联表 ----------

blog_tags = Table(
    "blog_tags",
    Base.metadata,
    Column("blog_id", Integer, ForeignKey("blogs.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


# ---------- 通用混入 ----------

class TimestampMixin:
    """自动管理创建和更新时间（UTC时间）的混入类"""
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="创建时间"
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="最后更新时间"
    )


# ---------- 用户 ----------

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False, comment="用户名")
    email = Column(String(255), unique=True, index=True, nullable=False, comment="邮箱")
    is_admin = Column(Boolean, default=False, nullable=False, comment="是否为管理员")
    password_hash = Column(String(255), nullable=True, comment="加密后的密码（OAuth 用户可为空）")
    oauth_provider = Column(String(20), nullable=True, comment="OAuth 提供商（如 github）")
    oauth_id = Column(String(100), nullable=True, index=True, comment="OAuth 用户 ID")
    avatar_url = Column(String(500), nullable=True, comment="头像 URL")

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


# ---------- 博客 ----------

class Blog(Base, TimestampMixin):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, comment="博客标题")
    slug = Column(
        String(250), unique=True, index=True, nullable=False,
        comment="URL 友好的唯一标识"
    )
    content = Column(Text, nullable=False, comment="博客正文（Markdown/Typst）")
    format = Column(String(10), default="markdown", nullable=False, comment="渲染格式：markdown 或 typst")
    summary = Column(String(300), nullable=True, comment="一句话总结")
    cover_image = Column(String(500), nullable=True, comment="封面图片 URL")
    published = Column(Boolean, default=False, nullable=False, comment="是否公开发布")
    views = Column(Integer, default=0, nullable=False, comment="浏览量")
    author_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="作者ID"
    )

    author = relationship("User", back_populates="blogs", lazy="select")
    comments = relationship(
        "Comment", back_populates="blog",
        cascade="all, delete-orphan", lazy="select"
    )
    likes = relationship(
        "Like", back_populates="blog",
        cascade="all, delete-orphan", lazy="select"
    )
    tags = relationship(
        "Tag", secondary=blog_tags, back_populates="blogs", lazy="select"
    )

    def __repr__(self):
        return f"<Blog(id={self.id}, title={self.title!r})>"


# ---------- 标签 ----------

class Tag(Base, TimestampMixin):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False, comment="标签名")
    slug = Column(String(50), unique=True, index=True, nullable=False, comment="标签 URL 标识")

    blogs = relationship(
        "Blog", secondary=blog_tags, back_populates="tags", lazy="select"
    )

    def __repr__(self):
        return f"<Tag(id={self.id}, name={self.name!r})>"


# ---------- 关于页 ----------

class AboutPage(Base):
    __tablename__ = "about_page"

    id = Column(Integer, primary_key=True, default=1, comment="固定 ID=1，单行记录")
    content = Column(Text, default="", nullable=False, comment="关于页内容（Markdown）")
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="最后更新时间"
    )

    def __repr__(self):
        return "<AboutPage id=1>"


# ---------- 评论 ----------

class Comment(Base, TimestampMixin):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False, comment="评论内容")
    author_name = Column(String(80), nullable=False, comment="评论者昵称")
    author_email = Column(String(255), nullable=False, comment="评论者邮箱（不公开）")
    blog_id = Column(
        Integer,
        ForeignKey("blogs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="被评论的博客ID"
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="关联注册用户ID（可为空）"
    )
    parent_id = Column(
        Integer,
        ForeignKey("comments.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
        comment="父评论ID（嵌套回复）"
    )
    quote = Column(Text, nullable=True, comment="引用内容（划线/引用回复）")

    blog = relationship("Blog", back_populates="comments", lazy="select")
    user = relationship("User", back_populates="comments", lazy="select")
    parent = relationship("Comment", remote_side="Comment.id", backref="replies", lazy="select")

    def __repr__(self):
        return f"<Comment(id={self.id}, blog_id={self.blog_id})>"


# ---------- 点赞 ----------

class Like(Base, TimestampMixin):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        comment="点赞用户ID（登录用户）"
    )
    ip_address = Column(
        String(45), nullable=True, index=True,
        comment="点赞者 IP 地址（未登录用户）"
    )
    blog_id = Column(
        Integer,
        ForeignKey("blogs.id", ondelete="CASCADE"),
        nullable=False,
        comment="被点赞博客ID"
    )

    user = relationship("User", back_populates="likes", lazy="select")
    blog = relationship("Blog", back_populates="likes", lazy="select")

    __table_args__ = (
        Index("ix_likes_user_id", "user_id"),
        Index("ix_likes_blog_id", "blog_id"),
        Index("ix_likes_ip_blog", "ip_address", "blog_id"),
    )

    def __repr__(self):
        return f"<Like(id={self.id}, blog_id={self.blog_id})>"
