"""认证路由：注册、登录、GitHub OAuth、获取当前用户"""
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from ..core.security import hash_password, verify_password, create_access_token, get_current_user
from ..core.config import GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URI
from ..database import get_db
from ..models import User
from ..schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse

FRONTEND_URL = "http://localhost:5173"

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ---------- 注册 / 登录 ----------

@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(status_code=409, detail="用户名已存在")
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=409, detail="邮箱已被注册")
    user = User(
        username=body.username,
        email=body.email,
        password_hash=hash_password(body.password),
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(data={"sub": str(user.id), "is_admin": False})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not user.password_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户名或密码错误")
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户名或密码错误")
    token = create_access_token(data={"sub": str(user.id), "is_admin": user.is_admin})
    return TokenResponse(access_token=token)


# ---------- GitHub OAuth ----------

@router.get("/github/url")
def github_login_url():
    """返回 GitHub OAuth 授权 URL"""
    if not GITHUB_CLIENT_ID:
        raise HTTPException(status_code=501, detail="GitHub OAuth 未配置（缺少 GITHUB_CLIENT_ID）")
    url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={GITHUB_REDIRECT_URI}"
        f"&scope=user:email"
    )
    return {"url": url}


@router.get("/github/callback")
def github_callback(code: str = Query(...), db: Session = Depends(get_db)):
    """GitHub OAuth 回调：用 code 换 token → 获取用户信息 → 登录/注册"""
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=501, detail="GitHub OAuth 未配置")

    # Step 1: code → access_token
    token_resp = httpx.post(
        "https://github.com/login/oauth/access_token",
        data={
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
            "redirect_uri": GITHUB_REDIRECT_URI,
        },
        headers={"Accept": "application/json"},
    )
    if token_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="GitHub 授权失败")
    token_data = token_resp.json()
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="无法获取 GitHub access_token")

    # Step 2: 获取 GitHub 用户信息
    user_resp = httpx.get(
        "https://api.github.com/user",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    if user_resp.status_code != 200:
        raise HTTPException(status_code=400, detail="获取 GitHub 用户信息失败")
    gh_user = user_resp.json()

    # Step 3: 获取邮箱（可能为 null 或需要单独请求）
    email = gh_user.get("email")
    if not email:
        email_resp = httpx.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if email_resp.status_code == 200:
            emails = email_resp.json()
            primary = next((e for e in emails if e.get("primary")), emails[0] if emails else None)
            if primary:
                email = primary["email"]
    if not email:
        raise HTTPException(status_code=400, detail="无法获取 GitHub 邮箱")

    github_id = str(gh_user["id"])
    login_name = gh_user["login"]
    avatar = gh_user.get("avatar_url", "")

    # Step 4: 查找或创建用户
    user = db.query(User).filter(
        User.oauth_provider == "github", User.oauth_id == github_id
    ).first()

    if not user:
        # 尝试按邮箱合并已有账号
        user = db.query(User).filter(User.email == email).first()
        if user:
            # 已有账号：补全 OAuth 字段
            user.oauth_provider = "github"
            user.oauth_id = github_id
            if not user.avatar_url:
                user.avatar_url = avatar
        else:
            # 新用户
            base_username = login_name
            username = base_username
            suffix = 1
            while db.query(User).filter(User.username == username).first():
                username = f"{base_username}{suffix}"
                suffix += 1
            user = User(
                username=username,
                email=email,
                oauth_provider="github",
                oauth_id=github_id,
                avatar_url=avatar,
                is_admin=False,
            )
        db.add(user)
    else:
        # 已有关联 OAuth 账号：更新头像
        if avatar and user.avatar_url != avatar:
            user.avatar_url = avatar

    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "is_admin": user.is_admin})
    return RedirectResponse(f"{FRONTEND_URL}/login?github_token={token}")


# ---------- 当前用户 ----------

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
