import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../context/AuthContext';
import AdminRoute from '../../../components/AdminRoute';
import AnnouncementManage from '../../../pages/admin/AnnouncementManage';
import * as announcementApi from '../../../api/announcement';

// Mock API
vi.mock('../../../api/announcement');

// Mock window.confirm
const mockConfirm = vi.spyOn(window, 'confirm');

describe('AnnouncementManage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default to admin user authenticated
    localStorage.setItem('access_token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ username: 'admin', role: 'ADMIN' }));
  });

  const createWrapper = (isAdmin = true) => {
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
            <AuthProvider>
              <AdminRoute isAdmin={isAdmin}>
                {children}
              </AdminRoute>
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      );
    };
  };

  const mockAnnouncements: announcementApi.Announcement[] = [
    {
      id: 1,
      title: '公告一标题',
      content: '公告一内容',
      authorId: 1,
      authorUsername: 'admin',
      isPinned: true,
      createdAt: '2026-06-01T12:00:00.000Z',
      updatedAt: '2026-06-01T12:00:00.000Z',
    },
    {
      id: 2,
      title: '公告二标题',
      content: '公告二内容',
      authorId: 1,
      authorUsername: 'admin',
      isPinned: false,
      createdAt: '2026-06-02T12:00:00.000Z',
      updatedAt: '2026-06-02T12:00:00.000Z',
    },
  ];

  it('should display 403 screen if user is not ADMIN', async () => {
    render(<AnnouncementManage />, { wrapper: createWrapper(false) });

    expect(screen.getByText('403 - 禁止访问')).toBeInTheDocument();
    expect(screen.getByText('您没有权限访问管理后台')).toBeInTheDocument();
  });

  it('should show loading state', async () => {
    vi.mocked(announcementApi.getAnnouncements).mockImplementation(
      () => new Promise(() => {})
    );

    render(<AnnouncementManage />, { wrapper: createWrapper(true) });

    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('should render announcements list successfully for admin users', async () => {
    vi.mocked(announcementApi.getAnnouncements).mockResolvedValue(mockAnnouncements);

    render(<AnnouncementManage />, { wrapper: createWrapper(true) });

    await waitFor(() => {
      expect(screen.getByText('公告一标题')).toBeInTheDocument();
    });

    expect(screen.getByText('公告二标题')).toBeInTheDocument();
    expect(screen.getAllByText('置顶').length).toBe(2); // One header, one row span
    expect(screen.getByText('普通')).toBeInTheDocument();
  });

  it('should show create form when clicking create button', async () => {
    const user = userEvent.setup();
    vi.mocked(announcementApi.getAnnouncements).mockResolvedValue(mockAnnouncements);

    render(<AnnouncementManage />, { wrapper: createWrapper(true) });

    await waitFor(() => {
      expect(screen.getByText('公告一标题')).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', { name: '+ 新建公告' });
    await user.click(createBtn);

    expect(screen.getByRole('heading', { name: '新建公告' })).toBeInTheDocument();
    expect(screen.getByLabelText(/公告标题/)).toBeInTheDocument();
    expect(screen.getByLabelText(/公告内容/)).toBeInTheDocument();
    expect(screen.getByLabelText('置顶公告')).toBeInTheDocument();
  });

  it('should successfully submit new announcement', async () => {
    const user = userEvent.setup();
    vi.mocked(announcementApi.getAnnouncements).mockResolvedValue(mockAnnouncements);
    vi.mocked(announcementApi.adminCreateAnnouncement).mockResolvedValue({
      id: 3,
      title: '新公告标题',
      content: '新公告内容',
      authorId: 1,
      authorUsername: 'admin',
      isPinned: false,
      createdAt: '2026-06-03T12:00:00.000Z',
      updatedAt: '2026-06-03T12:00:00.000Z',
    });

    render(<AnnouncementManage />, { wrapper: createWrapper(true) });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '+ 新建公告' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '+ 新建公告' }));

    const titleInput = screen.getByLabelText(/公告标题/);
    const contentInput = screen.getByLabelText(/公告内容/);
    const submitBtn = screen.getByRole('button', { name: '创建' });

    await user.type(titleInput, '新公告标题');
    await user.type(contentInput, '新公告内容');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(announcementApi.adminCreateAnnouncement).toHaveBeenCalledWith({
        title: '新公告标题',
        content: '新公告内容',
        isPinned: false,
      });
      expect(screen.getByText('公告创建成功')).toBeInTheDocument();
    });
  });

  it('should fill form when clicking edit button and successfully submit changes', async () => {
    const user = userEvent.setup();
    vi.mocked(announcementApi.getAnnouncements).mockResolvedValue(mockAnnouncements);
    vi.mocked(announcementApi.adminUpdateAnnouncement).mockResolvedValue({
      ...mockAnnouncements[1],
      title: '已更新的标题',
    });

    render(<AnnouncementManage />, { wrapper: createWrapper(true) });

    await waitFor(() => {
      expect(screen.getByText('公告二标题')).toBeInTheDocument();
    });

    const editBtns = screen.getAllByRole('button', { name: '编辑' });
    // First button corresponds to mockAnnouncements[0] (id: 1), second to mockAnnouncements[1] (id: 2)
    await user.click(editBtns[1]);

    expect(screen.getByRole('heading', { name: '编辑公告' })).toBeInTheDocument();
    const titleInput = screen.getByLabelText(/公告标题/) as HTMLInputElement;
    expect(titleInput.value).toBe('公告二标题');

    await user.clear(titleInput);
    await user.type(titleInput, '已更新的标题');
    await user.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => {
      expect(announcementApi.adminUpdateAnnouncement).toHaveBeenCalledWith(2, {
        title: '已更新的标题',
        content: '公告二内容',
        isPinned: false,
      });
      expect(screen.getByText('公告更新成功')).toBeInTheDocument();
    });
  });

  it('should call delete API after clicking delete button and confirming', async () => {
    const user = userEvent.setup();
    vi.mocked(announcementApi.getAnnouncements).mockResolvedValue(mockAnnouncements);
    vi.mocked(announcementApi.adminDeleteAnnouncement).mockResolvedValue(undefined);
    mockConfirm.mockReturnValue(true);

    render(<AnnouncementManage />, { wrapper: createWrapper(true) });

    await waitFor(() => {
      expect(screen.getByText('公告一标题')).toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByRole('button', { name: '删除' });
    await user.click(deleteBtns[0]);

    expect(mockConfirm).toHaveBeenCalledWith('确定要删除公告「公告一标题」吗？');
    await waitFor(() => {
      expect(vi.mocked(announcementApi.adminDeleteAnnouncement).mock.calls[0][0]).toBe(1);
      expect(screen.getByText('公告删除成功')).toBeInTheDocument();
    });
  });
});
