export type CommentableType = 'task' | 'listitem';

export interface CommentUser {
  id: number;
  email: string;
  full_name?: string;
}

export interface Comment {
  id: string;
  user_id: number;
  account_id: number;
  content: string;
  commentable_type: CommentableType;
  commentable_id: number;
  parent_comment_id?: string;
  is_edited: boolean;
  edited_at?: string;
  mentioned_user_ids?: number[];
  created_at: string;
  updated_at: string;
  user?: CommentUser;
  reply_count: number;
}

export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

export interface CommentListResponse {
  comments: CommentWithReplies[];
  total: number;
}

export interface CommentCreateRequest {
  content: string;
  commentable_type: CommentableType;
  commentable_id: number;
  parent_comment_id?: string;
  mentioned_user_ids?: number[];
}

export interface CommentUpdateRequest {
  content: string;
  mentioned_user_ids?: number[];
}

export interface CommentListParams {
  commentable_type: CommentableType;
  commentable_id: number;
  include_replies?: boolean;
  skip?: number;
  limit?: number;
}
