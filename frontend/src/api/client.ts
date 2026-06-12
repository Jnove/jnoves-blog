import axios from 'axios';
import type { Post, PostList, Comment, CommentForm, LoginForm, RegisterForm, TokenResponse, Tag, PostSummary, LikeStatus, UserInfo, AdminStats, AdminCommentList, AboutContent, GitHubUrlResponse, UploadResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器：自动附加 JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：401 时清除 token 并通知 AuthContext
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(err);
  }
);

export default api;

// ---- API 函数 ----

export const postsApi = {
  list: (page = 1, tag?: string) =>
    api.get<PostList>('/posts', { params: { page, tag } }).then(r => r.data),

  get: (slug: string) =>
    api.get<Post>(`/posts/${slug}`).then(r => r.data),

  create: (data: Record<string, unknown>) =>
    api.post<Post>('/posts', data).then(r => r.data),

  update: (slug: string, data: Record<string, unknown>) =>
    api.put<Post>(`/posts/${slug}`, data).then(r => r.data),

  delete: (slug: string) =>
    api.delete(`/posts/${slug}`),
};

export const commentsApi = {
  list: (postId: number) =>
    api.get<Comment[]>('/comments', { params: { post_id: postId } }).then(r => r.data),

  create: (data: CommentForm) =>
    api.post<Comment>('/comments', data).then(r => r.data),
};

export const tagsApi = {
  list: () =>
    api.get<Tag[]>('/tags').then(r => r.data),
};

export const searchApi = {
  search: (q: string) =>
    api.get<PostSummary[]>('/search', { params: { q } }).then(r => r.data),
};

export const authApi = {
  login: (data: LoginForm) =>
    api.post<TokenResponse>('/auth/login', data).then(r => r.data),

  register: (data: RegisterForm) =>
    api.post<TokenResponse>('/auth/register', data).then(r => r.data),

  me: () =>
    api.get<UserInfo>('/auth/me').then(r => r.data),

  githubUrl: () =>
    api.get<GitHubUrlResponse>('/auth/github/url').then(r => r.data),

  githubCallback: (code: string) =>
    api.get<TokenResponse>('/auth/github/callback', { params: { code } }).then(r => r.data),
};

export const uploadApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<UploadResponse>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};

export const likesApi = {
  check: (blogId: number) =>
    api.get<LikeStatus>(`/likes/${blogId}`).then(r => r.data),

  like: (blogId: number) =>
    api.post<LikeStatus>('/likes', { blog_id: blogId }).then(r => r.data),

  unlike: (blogId: number) =>
    api.delete<LikeStatus>(`/likes/${blogId}`).then(r => r.data),
};

export const adminApi = {
  stats: () =>
    api.get<AdminStats>('/admin/stats').then(r => r.data),

  comments: (page = 1) =>
    api.get<AdminCommentList>('/admin/comments', { params: { page, size: 20 } }).then(r => r.data),

  deleteComment: (id: number) =>
    api.delete(`/admin/comments/${id}`),
};

export const aboutApi = {
  get: () =>
    api.get<AboutContent>('/about').then(r => r.data),

  update: (content: string) =>
    api.put<AboutContent>('/about', { content }).then(r => r.data),
};
