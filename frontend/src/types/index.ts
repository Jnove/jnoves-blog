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
  created_at: string;
}

export interface CommentForm {
  post_id: number;
  author_name: string;
  author_email: string;
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
