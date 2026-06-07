"""应用配置，从环境变量加载"""
import os

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Admin 账号（个人博客，单用户，通过环境变量或 seed 脚本设置）
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@blog.local")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
