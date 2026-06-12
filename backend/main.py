"""
FastAPI 应用入口
启动时自动建表并创建管理员账号（仅开发环境），
注册中间件、路由，管理数据库生命周期。
"""
import os
import uuid
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import engine, Base, SessionLocal
from . import models
from .models import User
from .core.security import hash_password
from .core.config import ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD

# 日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_admin():
    """同步管理员账号：创建或更新为 .env 中配置的用户名/密码"""
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == ADMIN_USERNAME).first()
        if admin:
            new_hash = hash_password(ADMIN_PASSWORD)
            if admin.password_hash != new_hash or admin.email != ADMIN_EMAIL or not admin.is_admin:
                admin.password_hash = new_hash
                admin.email = ADMIN_EMAIL
                admin.is_admin = True
                db.commit()
                logger.info(f"已同步管理员账号: {ADMIN_USERNAME}")
        else:
            admin = User(
                username=ADMIN_USERNAME,
                email=ADMIN_EMAIL,
                password_hash=hash_password(ADMIN_PASSWORD),
                is_admin=True,
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
from .routers import auth, posts, comments, tags, search, likes, admin, about, feed

app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(tags.router)
app.include_router(search.router)
app.include_router(likes.router)
app.include_router(admin.router)
app.include_router(about.router)
app.include_router(feed.router)


# 上传目录
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}


@app.post("/api/upload", tags=["system"])
async def upload_image(file: UploadFile = File(...)):
    """上传图片，返回访问 URL"""
    ext = os.path.splitext(file.filename or "image.png")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"不支持的图片格式：{ext}")
    # 限制 5MB
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="图片大小不能超过 5MB")
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(content)
    return {"url": f"/uploads/{filename}", "filename": filename}


@app.get("/api/test", tags=["system"])
async def test_api():
    """前端连接测试端点"""
    return {
        "status": "success",
        "message": "你好，React！我是 FastAPI 后端！",
    }


# 静态文件挂载（必须在路由之后，否则会拦截 API 请求）
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
