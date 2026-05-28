import client from './client';
import type { ApiResponse } from './types';

/**
 * Announcement type
 */
export interface Announcement {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorUsername: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create announcement request type
 */
export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  isPinned?: boolean;
}

/**
 * Update announcement request type
 */
export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  isPinned?: boolean;
}

/**
 * Get all announcements
 * GET /api/announcements
 */
export async function getAnnouncements(): Promise<Announcement[]> {
  const response = await client.get<Announcement[]>('/announcements');
  return response.data;
}

/**
 * Get announcement by ID
 * GET /api/announcements/{id}
 */
export async function getAnnouncement(id: number): Promise<Announcement> {
  const response = await client.get<Announcement>(`/announcements/${id}`);
  return response.data;
}

/**
 * Create announcement (admin)
 * POST /api/admin/announcements
 */
export async function adminCreateAnnouncement(data: CreateAnnouncementRequest): Promise<Announcement> {
  const response = await client.post<ApiResponse<Announcement>>('/admin/announcements', data);
  return response.data.data;
}

/**
 * Update announcement (admin)
 * PUT /api/admin/announcements/{id}
 */
export async function adminUpdateAnnouncement(id: number, data: UpdateAnnouncementRequest): Promise<Announcement> {
  const response = await client.put<ApiResponse<Announcement>>(`/admin/announcements/${id}`, data);
  return response.data.data;
}

/**
 * Delete announcement (admin)
 * DELETE /api/admin/announcements/{id}
 */
export async function adminDeleteAnnouncement(id: number): Promise<void> {
  await client.delete(`/admin/announcements/${id}`);
}
