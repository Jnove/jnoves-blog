# Jnove's Blog

个人技术博客系统，支持 Markdown / Typst 写作，带有评论、点赞、搜索、RSS 订阅和 GitHub OAuth 登录。

**技术栈**：FastAPI + SQLAlchemy + React 19 + TypeScript + Vite

---

## 项目结构

```
jnoves-blog/
├── backend/                  # FastAPI 后端
│   ├── main.py               # 应用入口，生命周期，路由注册，图片上传
│   ├── database.py           # 数据库连接与会话管理
│   ├── models.py             # ORM 模型（User, Blog, Tag, Comment, Like, AboutPage）
│   ├── core/
│   │   ├── config.py         # 环境变量配置（JWT、Admin 账号、GitHub OAuth）
│   │   └── security.py       # 密码哈希、JWT 签发/验证、认证依赖
│   ├── routers/
│   │   ├── auth.py           # 注册、登录、GitHub OAuth、获取当前用户
│   │   ├── posts.py          # /api/posts CRUD + 归档 + 相关文章
│   │   ├── comments.py       # /api/comments 评论（嵌套+引用）
│   │   ├── likes.py          # /api/likes 点赞（游客+用户）
│   │   ├── about.py          # /api/about 关于页
│   │   ├── admin.py          # /api/admin 统计+评论管理
│   │   ├── tags.py           # GET /api/tags
│   │   ├── search.py         # GET /api/search（分词+相关性排序）
│   │   └── feed.py           # GET /api/feed/rss（RSS 2.0 订阅源）
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
│       ├── hooks/
│       │   └── useIsDark.ts   # 暗色主题检测
│       ├── components/       # 通用组件
│       │   ├── Layout.tsx    # 全局布局（导航 + 进度条 + 回到顶部）
│       │   ├── PostCard.tsx  # 文章卡片（封面+摘要+阅读时间）
│       │   ├── CodeBlock.tsx # 代码块（语法高亮+一键复制）
│       │   ├── TypstRenderer.tsx  # Typst WASM 渲染
│       │   ├── CommentList.tsx    # 递归嵌套评论列表
│       │   ├── CommentForm.tsx    # 评论表单（支持引用回复）
│       │   ├── ShareBar.tsx       # 分享按钮（复制链接+Twitter）
│       │   ├── AdminRoute.tsx     # 管理员路由守卫
│       │   ├── ProgressBar.tsx    # 阅读进度条
│       │   ├── BackToTop.tsx      # 回到顶部按钮
│       │   ├── TableOfContents.tsx # 文章目录侧边栏
│       │   ├── HomeSidebar.tsx    # 首页侧栏（搜索+标签云+RSS订阅）
│       │   └── Footer.tsx         # 页脚
│       ├── pages/            # 页面
│       │   ├── Home.tsx      # 首页（打字机 slogan + 标签过滤 + 分页）
│       │   ├── Post.tsx      # 文章详情（条件渲染 Markdown/Typst + TOC + 评论 + 点赞 + 分享 + 相关文章）
│       │   ├── Search.tsx    # 全文搜索
│       │   ├── Archive.tsx   # 文章归档（按年月分组）
│       │   ├── About.tsx     # 关于页（Markdown 渲染，管理员可编辑）
│       │   ├── Login.tsx     # 用户登录（含 GitHub OAuth）
│       │   ├── Register.tsx  # 用户注册
│       │   ├── AdminLogin.tsx
│       │   ├── AdminEditor.tsx     # 文章编辑器（格式选择+图片上传+预览）
│       │   ├── AdminAbout.tsx      # 关于页编辑器
│       │   └── AdminDashboard.tsx  # 管理仪表盘（统计+评论管理）
│       ├── App.tsx           # React Router 路由
│       └── main.tsx          # 入口
├── requirements.txt          # Python 依赖
└── .env                      # 环境变量（不纳入版本控制）
```

---

## 快速开始

### 1. 环境准备

```bash
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

# GitHub OAuth（可选）
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:8000/api/auth/github/callback
```

不创建 `.env` 则使用默认值（admin / admin123），**生产环境务必修改**。

首次启动时 `seed_admin()` 自动创建/同步管理员账号。

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
| GET | `/api/auth/github/url` | 无 | 获取 GitHub OAuth 授权 URL |
| GET | `/api/auth/github/callback` | 无 | GitHub OAuth 回调 |

### 文章

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/posts?page=&size=&tag=` | 无 | 文章列表（分页+标签过滤） |
| GET | `/api/posts/archive` | 无 | 文章归档（按年月分组） |
| GET | `/api/posts/{slug}` | 无 | 文章详情（自动增加阅读量） |
| GET | `/api/posts/{slug}/related` | 无 | 相关文章推荐（按标签重叠度） |
| POST | `/api/posts` | Admin | 创建文章 |
| PUT | `/api/posts/{slug}` | Admin | 更新文章 |
| DELETE | `/api/posts/{slug}` | Admin | 删除文章 |

### 评论

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/comments?post_id=` | 无 | 获取文章评论（含嵌套回复） |
| POST | `/api/comments` | 用户 | 发表评论（支持 parent_id + quote） |

### 点赞

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/likes` | 可选 | 点赞（登录用户按 user_id，游客按 IP 去重） |
| DELETE | `/api/likes/{blog_id}` | 可选 | 取消点赞 |
| GET | `/api/likes/{blog_id}` | 可选 | 查询点赞状态与数量 |

### 系统

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/tags` | 无 | 全部标签 |
| GET | `/api/search?q=` | 无 | 全文搜索（分词+相关性排序） |
| GET | `/api/feed/rss` | 无 | RSS 2.0 订阅源 |
| POST | `/api/upload` | Admin | 上传图片（5MB 限制） |
| GET | `/api/about` | 无 | 获取关于页内容 |
| PUT | `/api/about` | Admin | 更新关于页内容 |
| GET | `/api/admin/stats` | Admin | 管理后台统计数据 |
| GET | `/api/admin/comments?page=&size=` | Admin | 评论管理列表 |
| DELETE | `/api/admin/comments/{id}` | Admin | 删除评论 |

---

## 数据库模型

```
User ──1:N──> Blog ──1:N──> Comment ──1:N──> Comment (自引用 parent_id)
  │    │         │
  │    │         └──1:N──> Like
  │    │
  └────┴──1:N──> Like

Blog ──M:N──> Tag  (blog_tags 关联表)

AboutPage (单行表，id=1)
```

- **User**：用户账号，含 `is_admin` 区分管理员。支持 GitHub OAuth 登录（oauth_provider + oauth_id）。OAuth 用户密码为空。
- **Blog**：文章，支持 `format` 字段切换 Markdown/Typst 渲染，slug 唯一标识，标签多对多，草稿/发布切换，摘要、封面图、浏览量统计。
- **Comment**：评论，支持嵌套回复（parent_id 自引用）和引用文本（quote）。关联注册用户。
- **Tag**：标签，与文章多对多关联。
- **Like**：点赞，登录用户按 user_id 去重，游客按 IP 地址去重。
- **AboutPage**：关于页，单行记录（id=1），管理员可编辑 Markdown 内容。

---

## 特性

- 🔐 **JWT 认证**：用户注册/登录，管理员角色分离，AuthContext 持久化登录态
- 🔑 **GitHub OAuth**：第三方登录，自动创建关联账号
- 📝 **双格式写作**：Markdown（react-markdown + 语法高亮）和 Typst（WASM 编译器渲染），编辑器内一键切换
- 🖼️ **封面图与摘要**：文章支持上传封面图和一句话总结，列表页展示缩略图
- ❤️ **游客点赞**：无需登录即可点赞，IP 去重；登录用户按账号去重
- 💬 **嵌套评论**：支持回复和引用，递归显示评论树
- 📡 **RSS 订阅**：RSS 2.0 订阅源，读者可通过阅读器订阅博客更新
- 🔗 **相关文章**：文章底部推荐标签相似的文章
- 📤 **分享按钮**：一键复制链接 + Twitter 分享
- 📂 **文章归档**：按年月分组浏览所有文章
- 📊 **管理仪表盘**：文章统计 + 评论管理（分页列表+删除）
- 📄 **分页浏览**：首页文章列表支持分页和标签筛选
- 🔍 **全文搜索**：分词匹配 + 相关性打分（标题权重高于正文）
- ✏️ **可编辑关于页**：管理员可编辑关于页 Markdown 内容，实时预览
- 📋 **代码复制**：代码块语法高亮 + 一键复制
- 📑 **文章目录**：自动生成 TOC 侧边栏，滚动高亮当前位置
- 📶 **阅读进度条**：页面顶部彩色进度条
- ⬆️ **回到顶部**：悬浮按钮
- 🌓 **明暗主题**：CSS 变量驱动，淡绿米白浅色 / 暖棕暗色
- 🌐 **中文界面**：全站中文本地化
