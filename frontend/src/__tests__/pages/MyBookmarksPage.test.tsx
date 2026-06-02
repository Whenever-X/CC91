import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../context/AuthContext';
import MyBookmarksPage from '../../pages/MyBookmarksPage';
import * as bookmarkApi from '../../api/bookmark';

vi.mock('../../api/bookmark');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

const mockBookmark = {
  id: 10,
  title: 'Bookmarked Post 1',
  content: 'Content of bookmarked post.',
  authorId: 2,
  authorUsername: 'otheruser',
  categoryName: '心灵之约',
  createdAt: '2024-01-04T12:00:00',
  updatedAt: '2024-01-04T12:00:00',
  viewCount: 15,
  commentCount: 2,
  status: 'APPROVED',
};

describe('MyBookmarksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ username: 'testuser', email: 'test@example.com' }));
  });

  const createWrapper = (initialEntries: string[] = ['/dashboard/bookmarks']) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    return function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={initialEntries}>
            <AuthProvider>{children}</AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      );
    };
  };

  it('应该渲染我的收藏列表', async () => {
    vi.mocked(bookmarkApi.getMyBookmarks).mockResolvedValue([mockBookmark]);

    render(<MyBookmarksPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Bookmarked Post 1')).toBeInTheDocument();
      expect(screen.getByText('Content of bookmarked post.')).toBeInTheDocument();
      expect(screen.getByText('作者: otheruser')).toBeInTheDocument();
    });
    expect(screen.getByText('共 1 篇帖子')).toBeInTheDocument();
  });

  it('点击帖子应跳转到详情页', async () => {
    const user = userEvent.setup();
    vi.mocked(bookmarkApi.getMyBookmarks).mockResolvedValue([mockBookmark]);

    render(<MyBookmarksPage />, { wrapper: createWrapper() });

    const title = await screen.findByText('Bookmarked Post 1');
    const card = title.closest('.card');
    await user.click(card!);

    expect(mockNavigate).toHaveBeenCalledWith('/posts/10');
  });

  it('空列表时显示相应提示', async () => {
    vi.mocked(bookmarkApi.getMyBookmarks).mockResolvedValue([]);

    render(<MyBookmarksPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('您还没有收藏过帖子')).toBeInTheDocument();
    });
  });

  it('点击返回 Dashboard 应导航到 /dashboard', async () => {
    const user = userEvent.setup();
    vi.mocked(bookmarkApi.getMyBookmarks).mockResolvedValue([]);

    render(<MyBookmarksPage />, { wrapper: createWrapper() });

    const links = await screen.findAllByRole('link', { name: '个人中心' });
    const sidebarLink = links.find(el => el.closest('.cc98-personal-sidebar'));
    await user.click(sidebarLink!);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
