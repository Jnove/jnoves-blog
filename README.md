# Jnove's Blog

个人技术博客系统，支持 Markdown / Typst 写作，带有评论和全文搜索功能。

**技术栈**：FastAPI + SQLAlchemy + React 19 + TypeScript + Vite

---

## 项目结构

```
jnoves-blog/
├── backend/                  # FastAPI 后端
│   ├── main.py               # 应用入口，生命周期，路由注册
│   ├── database.py           # 数据库连接与会话管理
│   ├── models.py             # ORM 模型（User, Blog, Tag, Comment, Like）
│   ├── core/
│   │   ├── config.py         # 环境变量配置（JWT、Admin 账号）
│   │   └── security.py       # 密码哈希、JWT 签发/验证、认证依赖
│   ├── routers/
│   │   ├── auth.py           # POST /api/auth/login
│   │   ├── posts.py          # /api/posts CRUD
│   │   ├── comments.py       # /api/comments 评论
│   │   ├── tags.py           # GET /api/tags
│   │   └── search.py         # GET /api/search
│   └── schemas/
│       ├── auth.py           # LoginRequest, TokenResponse
│       ├── post.py           # PostCreate/Update/Response/Summary/List
│       ├── comment.py        # CommentCreate/Response
│       └── tag.py            # TagResponse
├── frontend/                 # React 前端
│   └── src/
│       ├── api/client.ts     # Axios 实例 + API 函数
│       ├── types/index.ts    # TypeScript 类型定义
│       ├── components/       # 通用组件
│       │   ├── Layout.tsx    # 全局布局（导航栏 + 内容区）
│       │   ├── PostCard.tsx  # 文章卡片
│       │   ├── CommentList.tsx
│       │   └── CommentForm.tsx
│       ├── pages/            # 页面
│       │   ├── Home.tsx      # 首页（文章列表 + 标签过滤）
│       │   ├── Post.tsx      # 文章详情 + 评论区
│       │   ├── About.tsx     # 关于页
│       │   ├── Search.tsx    # 全文搜索
│       │   ├── AdminLogin.tsx
│       │   └── AdminEditor.tsx
│       ├── App.tsx           # React Router 路由
│       └── main.tsx          # 入口
├── docs/superpowers/         # 设计文档与实现计划
├── requirements.txt          # Python 依赖
└── .env                      # 环境变量（不纳入版本控制）
```

---

## 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <repo-url> && cd jnoves-blog

# 创建虚拟环境并安装依赖
python -m venv .venv
source .venv/Scripts/activate   # Windows
pip install -r requirements.txt

# 安装前端依赖
cd frontend && npm install && cd ..
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
SECRET_KEY=your-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
ADMIN_EMAIL=admin@example.com
```

不创建 `.env` 则会使用默认值（admin / admin123），**生产环境务必修改**。

### 3. 启动开发服务器

```bash
# 终端 1：后端（端口 8000，热重载）
.venv/Scripts/uvicorn backend.main:app --reload

# 终端 2：前端（端口 5173，热重载）
cd frontend && npm run dev
```

浏览器打开 `http://localhost:5173` 即可访问。

---

## API 端点一览

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/auth/login` | 无 | 管理员登录，返回 JWT |
| GET | `/api/posts?page=&size=&tag=` | 无 | 文章列表（分页+标签过滤，仅公开文章） |
| GET | `/api/posts/{slug}` | 无 | 文章详情 |
| POST | `/api/posts` | Admin | 创建文章 |
| PUT | `/api/posts/{slug}` | Admin | 更新文章 |
| DELETE | `/api/posts/{slug}` | Admin | 删除文章 |
| GET | `/api/comments?post_id=` | 无 | 获取文章评论 |
| POST | `/api/comments` | 无 | 发表评论（需昵称+邮箱） |
| GET | `/api/tags` | 无 | 全部标签 |
| GET | `/api/search?q=` | 无 | 全文搜索（标题+正文） |

---

## 数据库模型

```
User ──1:N──> Blog ──1:N──> Comment
  │              │
  └──1:N──> Like │
                 │
Blog ──M:N──> Tag  (blog_tags 关联表)
```

- **User**：管理员账号，启动时自动创建/同步
- **Blog**：文章，支持 slug、标签、公开/草稿状态，使用 UTC 时间戳
- **Comment**：评论，含昵称（公开）和邮箱（不公开）
- **Tag**：标签，与文章多对多关联
- **Like**：点赞模型已定义，API 待后续开放

---

## 特性

- 🔐 **JWT 认证**：单一管理员，无注册流程，`.env` 配置账号
- 📝 **文章管理**：Markdown / Typst 写作，草稿/发布切换
- 🏷️ **标签系统**：多标签，按标签筛选文章
- 💬 **评论系统**：公开可读，访客可发（昵称+邮箱）
- 🔍 **全文搜索**：基于 SQL LIKE 的文章搜索
- 🌓 **明暗主题**：CSS 变量驱动的 light/dark 自适应
- 🌐 **中文界面**：全站中文本地化
