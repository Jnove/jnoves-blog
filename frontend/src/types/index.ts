export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface PostSummary {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  format: string;
  summary: string | null;
  cover_image: string | null;
  excerpt: string;
  reading_time: number;
  tags: Tag[];
  created_at: string;
  updated_at: string;
  comment_count: number;
  like_count: number;
  views: number;
}

export interface Post extends PostSummary {
  content: string;
  author_id: number;
}

export interface Comment {
  id: number;
  author_name: string;
  content: string;
  blog_id: number;
  user_id: number | null;
  parent_id: number | null;
  quote: string | null;
  replies: Comment[];
  created_at: string;
}

export interface CommentForm {
  post_id: number;
  content: string;
  parent_id?: number;
  quote?: string;
}

export interface PostList {
  items: PostSummary[];
  total: number;
}

export interface LoginForm {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LikeStatus {
  liked: boolean;
  like_count: number;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
}

export interface GitHubUrlResponse {
  url: string;
}

export interface AdminStats {
  post_count: number;
  published_count: number;
  comment_count: number;
  tag_count: number;
  total_views: number;
}

export interface AdminComment {
  id: number;
  author_name: string;
  content: string;
  blog_id: number;
  blog_title: string;
  blog_slug: string;
  user_id: number | null;
  created_at: string;
}

export interface AdminCommentList {
  items: AdminComment[];
  total: number;
}

export interface AboutContent {
  id: number;
  content: string;
  updated_at: string | null;
}
