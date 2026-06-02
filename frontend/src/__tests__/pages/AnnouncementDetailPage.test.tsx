import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AnnouncementDetailPage from '../../pages/AnnouncementDetailPage';
import * as announcementApi from '../../api/announcement';

// Mock API
vi.mock('../../api/announcement');

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AnnouncementDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createWrapper = (route = '/announcements/1') => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/announcements/:id" element={children} />
            <Route path="/" element={<div>首页</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('should show loading state', () => {
    vi.mocked(announcementApi.getAnnouncement).mockImplementation(
      () => new Promise(() => {})
    );

    render(<AnnouncementDetailPage />, { wrapper: createWrapper() });

    expect(screen.getByText('正在载入公告...')).toBeInTheDocument();
  });

  it('should show error when link is invalid (id = 0)', () => {
    render(<AnnouncementDetailPage />, { wrapper: createWrapper('/announcements/0') });

    expect(screen.getByText('链接无效')).toBeInTheDocument();
    expect(screen.getByText('公告 ID 格式不正确')).toBeInTheDocument();
  });

  it('should show error when link is invalid (id is NaN)', () => {
    render(<AnnouncementDetailPage />, { wrapper: createWrapper('/announcements/abc') });

    expect(screen.getByText('链接无效')).toBeInTheDocument();
  });

  it('should show error when announcement does not exist', async () => {
    vi.mocked(announcementApi.getAnnouncement).mockRejectedValue(new Error('Not found'));

    render(<AnnouncementDetailPage />, { wrapper: createWrapper('/announcements/999') });

    await waitFor(() => {
      expect(screen.getByText('公告不存在')).toBeInTheDocument();
      expect(screen.getByText('该公告可能已被删除或链接无效')).toBeInTheDocument();
    });
  });

  it('should render announcement details successfully', async () => {
    const mockAnnouncement: announcementApi.Announcement = {
      id: 1,
      title: '测试公告标题',
      content: '测试公告内容详情',
      authorId: 1,
      authorUsername: 'admin',
      isPinned: false,
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-01T12:00:00.000Z',
    };

    vi.mocked(announcementApi.getAnnouncement).mockResolvedValue(mockAnnouncement);

    render(<AnnouncementDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('测试公告标题')).toBeInTheDocument();
      expect(screen.getByText('测试公告内容详情')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    expect(screen.queryByText('置顶')).not.toBeInTheDocument();
  });

  it('should show pinned badge when announcement is pinned', async () => {
    const mockAnnouncement: announcementApi.Announcement = {
      id: 1,
      title: '置顶公告标题',
      content: '置顶公告内容',
      authorId: 1,
      authorUsername: 'admin',
      isPinned: true,
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-01T12:00:00.000Z',
    };

    vi.mocked(announcementApi.getAnnouncement).mockResolvedValue(mockAnnouncement);

    render(<AnnouncementDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('置顶公告标题')).toBeInTheDocument();
      expect(screen.getByText('置顶')).toBeInTheDocument();
    });
  });

  it('should navigate back to home on return click', async () => {
    const user = userEvent.setup();
    const mockAnnouncement: announcementApi.Announcement = {
      id: 1,
      title: '测试公告',
      content: '测试内容',
      authorId: 1,
      authorUsername: 'admin',
      isPinned: false,
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-01T12:00:00.000Z',
    };

    vi.mocked(announcementApi.getAnnouncement).mockResolvedValue(mockAnnouncement);

    render(<AnnouncementDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('测试公告')).toBeInTheDocument();
    });

    const backLink = screen.getByText('← 返回首页');
    await user.click(backLink);

    expect(screen.getByText('首页')).toBeInTheDocument();
  });
});
