import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../context/AuthContext';
import ContentModeration from '../../../pages/admin/ContentModeration';
import * as adminApi from '../../../api/admin';

vi.mock('../../../api/admin');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

describe('ContentModeration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ username: 'admin', email: 'admin@test.com', role: 'ADMIN' }));
  });

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    return function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <AuthProvider>{children}</AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      );
    };
  };

  const mockPosts = [
    {
      id: 1, title: 'Test Post', authorUsername: 'user1', categoryName: 'Tech',
      status: 'PUBLISHED', viewCount: 10, createdAt: '2026-01-01T00:00:00',
    },
    {
      id: 2, title: 'Draft Post', authorUsername: 'user2', categoryName: null,
      status: 'DRAFT', viewCount: 0, createdAt: '2026-01-02T00:00:00',
    },
  ];

  const mockComments = [
    {
      id: 1, content: 'Test comment', authorUsername: 'user1',
      postTitle: 'Test Post', postId: 1, status: 'VISIBLE',
      createdAt: '2026-01-01T00:00:00',
    },
  ];

  const setupMocks = () => {
    vi.mocked(adminApi.adminGetPosts).mockResolvedValue(mockPosts as any);
    vi.mocked(adminApi.adminGetComments).mockResolvedValue(mockComments as any);
    vi.mocked(adminApi.adminDeletePost).mockResolvedValue(undefined);
    vi.mocked(adminApi.adminDeleteComment).mockResolvedValue(undefined);
    vi.mocked(adminApi.adminUpdatePostStatus).mockResolvedValue(undefined);
  };

  it('renders posts list by default', async () => {
    setupMocks();

    render(<ContentModeration />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
    });

    expect(screen.getByText('Draft Post')).toBeInTheDocument();
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
  });

  it('clicking comments tab shows comments list', async () => {
    const user = userEvent.setup();
    setupMocks();

    render(<ContentModeration />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
    });

    await user.click(screen.getByText('评论审核'));

    await waitFor(() => {
      expect(screen.getByText('Test comment')).toBeInTheDocument();
    });

    expect(screen.getByText('user1')).toBeInTheDocument();
  });

  it('delete post calls adminDeletePost after confirm', async () => {
    const user = userEvent.setup();
    setupMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ContentModeration />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
    });

    // Find all delete buttons (for posts) and click the first one
    const deleteButtons = screen.getAllByText('删除');
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(adminApi.adminDeletePost).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ client: expect.anything() })
      );
    });
  });

  it('delete comment calls adminDeleteComment after confirm', async () => {
    const user = userEvent.setup();
    setupMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ContentModeration />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
    });

    // Switch to comments tab
    await user.click(screen.getByText('评论审核'));

    await waitFor(() => {
      expect(screen.getByText('Test comment')).toBeInTheDocument();
    });

    // Click the delete button for the comment
    const deleteButtons = screen.getAllByText('删除');
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(adminApi.adminDeleteComment).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ client: expect.anything() })
      );
    });
  });

  it('shows loading state', async () => {
    // Use delayed mocks so loading state is visible
    vi.mocked(adminApi.adminGetPosts).mockReturnValue(new Promise(() => {}));
    vi.mocked(adminApi.adminGetComments).mockReturnValue(new Promise(() => {}));

    render(<ContentModeration />, { wrapper: createWrapper() });

    // The posts tab is active by default, so we should see loading
    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });
});
