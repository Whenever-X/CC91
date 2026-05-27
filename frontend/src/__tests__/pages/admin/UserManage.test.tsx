import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../context/AuthContext';
import UserManage from '../../../pages/admin/UserManage';
import * as adminApi from '../../../api/admin';

vi.mock('../../../api/admin');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

describe('UserManage', () => {
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
    { id: 1, username: 'testuser', email: 'test@test.com', role: 'USER', isLocked: false, createdAt: '2026-01-01T00:00:00' },
    { id: 2, username: 'lockeduser', email: 'locked@test.com', role: 'ADMIN', isLocked: true, lockUntil: '2026-12-31T00:00:00', createdAt: '2026-01-02T00:00:00' },
  ];

  const setupMocks = () => {
    vi.mocked(adminApi.adminGetUsers).mockResolvedValue(mockUsers as any);
    vi.mocked(adminApi.adminBanUser).mockResolvedValue(undefined);
    vi.mocked(adminApi.adminUnbanUser).mockResolvedValue(undefined);
    vi.mocked(adminApi.adminUpdateUserRole).mockResolvedValue(undefined);
  };

  it('renders users table with usernames', async () => {
    setupMocks();

    render(<UserManage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    expect(screen.getByText('lockeduser')).toBeInTheDocument();
  });

  it('ban user calls adminBanUser after confirm', async () => {
    const user = userEvent.setup();
    setupMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<UserManage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    // Find the ban button (封禁) for the unlocked user
    const banButton = screen.getByText('封禁');
    await user.click(banButton);

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('testuser'));
    await waitFor(() => {
      expect(adminApi.adminBanUser).toHaveBeenCalledWith(1);
    });
  });

  it('unban user calls adminUnbanUser', async () => {
    const user = userEvent.setup();
    setupMocks();

    render(<UserManage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('lockeduser')).toBeInTheDocument();
    });

    // Find the unban button (解封) for the locked user
    const unbanButton = screen.getByText('解封');
    await user.click(unbanButton);

    // Unban does not use confirm dialog per the component code
    await waitFor(() => {
      expect(adminApi.adminUnbanUser).toHaveBeenCalledWith(2);
    });
  });

  it('role change dropdown calls adminUpdateUserRole after confirm', async () => {
    const user = userEvent.setup();
    setupMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<UserManage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    // Find the select dropdown for the first user (USER role) and change it to ADMIN
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'ADMIN');

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('管理员'));
    await waitFor(() => {
      expect(adminApi.adminUpdateUserRole).toHaveBeenCalledWith(1, 'ADMIN');
    });
  });

  it('shows loading state', async () => {
    vi.mocked(adminApi.adminGetUsers).mockReturnValue(new Promise(() => {}));

    render(<UserManage />, { wrapper: createWrapper() });

    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });
});
