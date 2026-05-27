import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../context/AuthContext';
import AdminDashboard from '../../../pages/admin/AdminDashboard';
import * as adminApi from '../../../api/admin';
import * as categoryApi from '../../../api/category';

vi.mock('../../../api/admin');
vi.mock('../../../api/category');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

describe('AdminDashboard', () => {
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

  const mockUsers = [
    { id: 1, username: 'user1', email: 'u1@test.com', role: 'USER', isLocked: false, createdAt: '2026-01-01T00:00:00' },
    { id: 2, username: 'admin1', email: 'a1@test.com', role: 'ADMIN', isLocked: true, createdAt: '2026-01-02T00:00:00' },
  ];

  const mockPosts = [
    { id: 1, title: 'Post 1', status: 'PUBLISHED' },
  ];

  const mockCategories = [
    { id: 1, name: 'Tech', description: 'Technology', sortOrder: 0 },
  ];

  const setupMocks = () => {
    vi.mocked(adminApi.adminGetUsers).mockResolvedValue(mockUsers as any);
    vi.mocked(adminApi.adminGetPosts).mockResolvedValue(mockPosts as any);
    vi.mocked(categoryApi.getCategories).mockResolvedValue(mockCategories as any);
  };

  it('renders stat cards with correct counts', async () => {
    setupMocks();

    render(<AdminDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Total users = 2
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    // Stat labels
    expect(screen.getByText('总用户数')).toBeInTheDocument();
    expect(screen.getByText('总帖子数')).toBeInTheDocument();
    expect(screen.getByText('版块数量')).toBeInTheDocument();
    expect(screen.getByText('封禁用户')).toBeInTheDocument();

    // Locked users count = 1
    const statValues = screen.getAllByText('1');
    expect(statValues.length).toBeGreaterThanOrEqual(2); // 1 post + 1 category + 1 locked = three "1"s
  });

  it('renders recent users table with username and role', async () => {
    setupMocks();

    render(<AdminDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    expect(screen.getByText('admin1')).toBeInTheDocument();
    expect(screen.getByText('普通用户')).toBeInTheDocument();
    expect(screen.getByText('管理员')).toBeInTheDocument();
  });

  it('renders quick action links to admin pages', async () => {
    setupMocks();

    render(<AdminDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('管理版块')).toBeInTheDocument();
    });

    expect(screen.getByText('内容审核')).toBeInTheDocument();
    expect(screen.getByText('用户管理')).toBeInTheDocument();

    // Verify link hrefs
    const categoriesLink = screen.getByText('管理版块').closest('a');
    const contentLink = screen.getByText('内容审核').closest('a');
    const usersLink = screen.getByText('用户管理').closest('a');

    expect(categoriesLink).toHaveAttribute('href', '/admin/categories');
    expect(contentLink).toHaveAttribute('href', '/admin/content');
    expect(usersLink).toHaveAttribute('href', '/admin/users');
  });

  it('shows loading state initially', async () => {
    // Use delayed mocks so loading state is visible
    vi.mocked(adminApi.adminGetUsers).mockReturnValue(new Promise(() => {}));
    vi.mocked(adminApi.adminGetPosts).mockReturnValue(new Promise(() => {}));
    vi.mocked(categoryApi.getCategories).mockReturnValue(new Promise(() => {}));

    render(<AdminDashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });
});
