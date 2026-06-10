import { describe, it, expect, vi, beforeEach } from 'vitest';
import client from '../../api/client';
import { adminGetComments, adminGetPosts, adminGetUsers } from '../../api/admin';

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedClient = vi.mocked(client);

describe('admin api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unwraps paged admin users from the real backend response', async () => {
    const users = [
      { id: 1, username: 'admin', email: 'admin@test.com', role: 'ADMIN', isLocked: false, createdAt: '2026-01-01T00:00:00' },
    ];
    mockedClient.get.mockResolvedValueOnce({ data: { content: users } });

    await expect(adminGetUsers()).resolves.toEqual(users);
    expect(mockedClient.get).toHaveBeenCalledWith('/admin/users');
  });

  it('unwraps paged admin posts and sends status filters', async () => {
    const posts = [
      { id: 1, title: 'Post', content: 'Body', authorId: 1, authorUsername: 'user', createdAt: '2026-01-01T00:00:00', updatedAt: '2026-01-01T00:00:00', viewCount: 0 },
    ];
    mockedClient.get.mockResolvedValueOnce({ data: { content: posts } });

    await expect(adminGetPosts('PUBLISHED')).resolves.toEqual(posts);
    expect(mockedClient.get).toHaveBeenCalledWith('/admin/posts', { params: { status: 'PUBLISHED' } });
  });

  it('unwraps paged admin comments from the real backend response', async () => {
    const comments = [
      { id: 1, postId: 1, postTitle: 'Post', authorId: 2, authorUsername: 'user', content: 'Comment', parentId: null, status: 'VISIBLE', createdAt: '2026-01-01T00:00:00' },
    ];
    mockedClient.get.mockResolvedValueOnce({ data: { content: comments } });

    await expect(adminGetComments()).resolves.toEqual(comments);
    expect(mockedClient.get).toHaveBeenCalledWith('/admin/comments');
  });

  it('keeps array responses compatible with mocks', async () => {
    const users = [
      { id: 1, username: 'user', email: 'user@test.com', role: 'USER', isLocked: false, createdAt: '2026-01-01T00:00:00' },
    ];
    mockedClient.get.mockResolvedValueOnce({ data: users });

    await expect(adminGetUsers()).resolves.toEqual(users);
  });
});
