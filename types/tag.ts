export interface Tag {
  id: number;
  name: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface TagWithCounts extends Tag {
  task_count: number;
  list_item_count: number;
}

export interface TagCreateRequest {
  name: string;
}

export interface TagObjectByNameRequest {
  tag_name: string;
}
