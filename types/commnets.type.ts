export interface CommentItem {
  id: number;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  read: boolean;
  parentId: number | null;
  author: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export interface SendCommentPayload {
  finishedId: number;
  content: string;
  parentId?: number | null;
}

export interface CommentContent {
  executionDay: string;
  updatedAt: string;
  comments: CommentItem[];
}
