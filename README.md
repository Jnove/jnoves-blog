# Jnove's Blog

个人技术博客系统，支持 Markdown / Typst 写作，带有评论、点赞和全文搜索功能。

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
│   │   ├── auth.py           # 注册、登录、获取当前用户
│   │   ├── posts.py          # /api/posts CRUD
│   │   ├── comments.py       # /api/comments 评论
│   │   ├── likes.py          # /api/likes 点赞（游客+用户）
│   │   ├── about.py          # /api/about 关于页
│   │   ├── admin.py          # /api/admin 统计+评论管理
│   │   ├── tags.py           # GET /api/tags
│   │   └── search.py         # GET /api/search
│   └── schemas/
│       ├── auth.py           # LoginRequest, RegisterRequest, TokenResponse, UserResponse
│       ├── post.py           # PostCreate/Update/Response/Summary/List
│       ├── comment.py        # CommentCreate/Response
│       └── tag.py            # TagResponse
├── frontend/                 # React 前端
│   └── src/
│       ├── api/client.ts     # Axios 实例 + API 函数
│       ├── types/index.ts    # TypeScript 类型定义
│       ├── contexts/
│       │   └── AuthContext.tsx  # 全局认证状态管理
│       ├── hooks/            # 共享 hooks
│       │   └── useIsDark.ts   # 暗色主题检测
│       ├── components/       # 通用组件
│       │   ├── Layout.tsx    # 全局布局（导航 + 进度条 + 回到顶部）
│       │   ├── PostCard.tsx  # 文章卡片（摘要+阅读时间）
│       │   ├── CodeBlock.tsx # 代码块（语法高亮+复制按钮）
│       │   ├── CommentList.tsx
│       │   ├── CommentForm.tsx
│       │   ├── AdminRoute.tsx  # 管理员路由守卫
│       │   ├── ProgressBar.tsx # 阅读进度条
│       │   ├── BackToTop.tsx   # 回到顶部按钮
│       │   └── TableOfContents.tsx  # 文章目录侧边栏
│       ├── pages/            # 页面
│       │   ├── Home.tsx      # 首页（打字机 slogan + 标签过滤 + 分页）
│       │   ├── Post.tsx      # 文章详情（Markdown 渲染 + TOC 侧栏 + 评论区 + 点赞）
│       │   ├── Login.tsx     # 用户登录
│       │   ├── Register.tsx  # 用户注册
│       │   ├── About.tsx     # 关于页（Markdown 渲染，管理员可编辑）
│       │   ├── Search.tsx    # 全文搜索
│       │   ├── AdminLogin.tsx
│       │   ├── AdminEditor.tsx     # 文章编辑器（编辑/预览切换）
│       │   ├── AdminAbout.tsx      # 关于页编辑器
│       │   └── AdminDashboard.tsx  # 管理仪表盘（统计+评论管理）
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

### 认证

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/auth/register` | 无 | 用户注册，返回 JWT |
| POST | `/api/auth/login` | 无 | 用户登录，返回 JWT |
| GET | `/api/auth/me` | 用户 | 获取当前登录用户信息 |

### 文章

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/posts?page=&size=&tag=` | 无 | 文章列表（分页+标签过滤，仅公开文章） |
| GET | `/api/posts/{slug}` | 无 | 文章详情（自动增加阅读量） |
| POST | `/api/posts` | Admin | 创建文章 |
| PUT | `/api/posts/{slug}` | Admin | 更新文章 |
| DELETE | `/api/posts/{slug}` | Admin | 删除文章 |

### 评论

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/comments?post_id=` | 无 | 获取文章评论 |
| POST | `/api/comments` | 用户 | 发表评论（使用登录账号身份） |

### 点赞

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/likes` | 可选 | 点赞（登录用户按 user_id，游客按 IP 去重） |
| DELETE | `/api/likes/{blog_id}` | 可选 | 取消点赞 |
| GET | `/api/likes/{blog_id}` | 可选 | 查询点赞状态与数量 |

### 关于页

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/about` | 无 | 获取关于页内容 |
| PUT | `/api/about` | Admin | 更新关于页内容 |

### 其他

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/tags` | 无 | 全部标签 |
| GET | `/api/search?q=` | 无 | 全文搜索（标题+正文） |
| GET | `/api/admin/stats` | Admin | 管理后台统计数据 |
| GET | `/api/admin/comments?page=&size=` | Admin | 评论管理列表 |
| DELETE | `/api/admin/comments/{id}` | Admin | 删除评论 |

---

## 数据库模型

```
User ──1:N──> Blog ──1:N──> Comment
  │    │         │
  │    │         └──1:N──> Like
  │    │
  └────┴──1:N──> Like

Blog ──M:N──> Tag  (blog_tags 关联表)
```

- **User**：用户账号，含 `is_admin` 区分管理员和普通用户，管理员启动时自动创建/同步
- **Blog**：文章，支持 slug、标签、公开/草稿状态、浏览量统计，使用 UTC 时间戳。API 自动生成摘要和阅读时间
- **Comment**：评论，关联注册用户，从登录 token 自动获取身份信息
- **Tag**：标签，与文章多对多关联
- **Like**：点赞，登录用户按 user_id 去重，游客按 IP 地址去重
- **AboutPage**：关于页，单行记录（id=1），管理员可编辑

---

## 特性

- 🔐 **JWT 认证**：用户注册/登录，管理员角色分离，AuthContext 持久化登录态
- 📝 **文章管理**：Markdown 渲染 + 语法高亮，草稿/发布切换，自动摘要+阅读时间，标签系统
- ❤️ **游客点赞**：无需登录即可点赞，IP 去重；登录用户按账号去重
- 💬 **评论系统**：登录后以账号身份评论，无需重复填写昵称邮箱；管理员可删除评论
- 📊 **管理仪表盘**：文章统计 + 评论管理（分页列表+删除）
- 📄 **分页浏览**：首页文章列表支持分页和标签筛选
- 🔍 **全文搜索**：基于 SQL LIKE 的文章搜索
- ✏️ **可编辑关于页**：管理员可编辑关于页内容（Markdown），实时预览
- 📋 **代码复制**：代码块一键复制按钮
- 📑 **文章目录**：自动生成 TOC 侧边栏，滚动高亮
- 📶 **阅读进度条**：页面顶部阅读进度条
- ⬆️ **回到顶部**：滚动超过 400px 后显示悬浮按钮
- 🌓 **明暗主题**：CSS 变量驱动的 light/dark 自适应
- 🌐 **中文界面**：全站中文本地化
