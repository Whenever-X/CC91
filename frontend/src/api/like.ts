import client from './client';
import type { ApiResponse } from './types';

export interface ToggleLikeResponse {
  likeCount: number;
  isLiked: boolean;
}

/**
 * Toggle post like status (Like / Unlike)
 * POST /api/posts/{postId}/like
 */
export async function togglePostLike(postId: number): Promise<ToggleLikeResponse> {
  const response = await client.post<ApiResponse<ToggleLikeResponse>>(`/posts/${postId}/like`);
  return response.data.data!;
}
