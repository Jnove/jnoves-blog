"""
FastAPI 应用入口
启动时自动建表并创建管理员账号（仅开发环境），
注册中间件、路由，管理数据库生命周期。
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base, SessionLocal
from . import models
from .models import User
from .core.security import hash_password
from .core.config import ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD

# 日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_admin():
    """如果 admin 用户不存在，则自动创建"""
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == ADMIN_USERNAME).first()
        if not existing:
            admin = User(
                username=ADMIN_USERNAME,
                email=ADMIN_EMAIL,
                password_hash=hash_password(ADMIN_PASSWORD),
            )
            db.add(admin)
            db.commit()
            logger.info(f"已创建管理员账号: {ADMIN_USERNAME}")
    finally:
        db.close()


# 生命周期
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用启动/关闭时的处理逻辑"""
    # 启动阶段
    logger.info("正在启动blog system后端...")
    Base.metadata.create_all(bind=engine)
    logger.info("数据库表已确认存在（create_all 仅在开发环境使用）")
    seed_admin()

    yield

    # 关闭阶段
    engine.dispose()
    logger.info("数据库连接池已释放，应用已关闭")


# 实例 FastAPI
app = FastAPI(
    title="Jonve's Blog System",
    description="一个全栈博客系统的后端 API，支持用户、文章、评论和点赞",
    version="0.1.0",
    lifespan=lifespan,
)


# 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # 前端开发地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 路由注册
from .routers import auth, posts, comments, tags, search

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(tags.router)
app.include_router(search.router)


@app.get("/api/test", tags=["system"])
async def test_api():
    """前端连接测试端点"""
    return {
        "status": "success",
        "message": "你好，React！我是 FastAPI 后端！",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
