import client from './client';
import type { ApiResponse } from './types';
import type { Post } from './post';

export interface ToggleBookmarkResponse {
  isBookmarked: boolean;
}

/**
 * Toggle post bookmark status (Bookmark / Unbookmark)
 * POST /api/posts/{postId}/bookmark
 */
export async function togglePostBookmark(postId: number): Promise<ToggleBookmarkResponse> {
  const response = await client.post<ApiResponse<ToggleBookmarkResponse>>(`/posts/${postId}/bookmark`);
  return response.data.data!;
}

/**
 * Get current user's bookmarked posts
 * GET /api/users/me/bookmarks
 */
export async function getMyBookmarks(): Promise<Post[]> {
  const response = await client.get<Post[]>('/users/me/bookmarks');
  return response.data;
}
