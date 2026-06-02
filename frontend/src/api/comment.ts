import client from './client';
import type { ApiResponse } from './types';

/**
 * Comment response type
 */
export interface Comment {
  id: number;
  postId: number;
  authorId: number;
  authorUsername: string;
  authorAvatarUrl?: string | null;
  content: string;
  parentId: number | null;
  createdAt: string;
  status: string;
  replies: Comment[];
}

/**
 * Create comment request type
 */
export interface CreateCommentRequest {
  content: string;
}

/**
 * Create comment
 * POST /api/posts/{postId}/comments - backend wraps in ApiResponse
 */
export async function createComment(postId: number, data: CreateCommentRequest): Promise<Comment> {
  const response = await client.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, data);
  return response.data.data!;
}

/**
 * Reply to comment
 * POST /api/comments/{id}/reply - backend wraps in ApiResponse
 */
export async function replyToComment(commentId: number, data: CreateCommentRequest): Promise<Comment> {
  const response = await client.post<ApiResponse<Comment>>(`/comments/${commentId}/reply`, data);
  return response.data.data!;
}

/**
 * Delete comment
 * DELETE /api/comments/{id}
 */
export async function deleteComment(commentId: number): Promise<void> {
  await client.delete(`/comments/${commentId}`);
}

/**
 * Update comment content
 * PUT /api/comments/{id} - backend wraps in ApiResponse
 */
export async function updateComment(commentId: number, content: string): Promise<Comment> {
  const response = await client.put<ApiResponse<Comment>>(`/comments/${commentId}`, { content });
  return response.data.data!;
}

/**
 * Get all comments for a post (tree structure)
 * GET /api/posts/{postId}/comments - backend returns List directly
 */
export async function getCommentsByPostId(postId: number): Promise<Comment[]> {
  const response = await client.get<Comment[]>(`/posts/${postId}/comments`);
  return response.data;
}
