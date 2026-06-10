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
  created_at: string;
}

export interface CommentForm {
  post_id: number;
  content: string;
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
  created_at: string;
}

export interface AdminStats {
  post_count: number;
  published_count: number;
  comment_count: number;
  tag_count: number;
  total_views: number;
}
