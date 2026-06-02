import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import ChangePasswordPage from '../../pages/ChangePasswordPage';
import * as userApi from '../../api/user';

// Mock API
vi.mock('../../api/user');

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const createWrapper = (isAuthenticated = true) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    if (isAuthenticated) {
      localStorage.setItem('access_token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ username: 'testuser', role: 'USER' }));
    }

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('should redirect unauthenticated users to login', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });
    localStorage.clear();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/dashboard/password']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<div>登录页面</div>} />
              <Route
                path="/dashboard/password"
                element={
                  <ProtectedRoute>
                    <ChangePasswordPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('登录页面')).toBeInTheDocument();
    });
  });

  it('should render form fields successfully for authenticated users', async () => {
    render(<ChangePasswordPage />, { wrapper: createWrapper(true) });

    await waitFor(() => {
      expect(screen.getByText('当前密码')).toBeInTheDocument();
    });

    expect(screen.getByText('新密码')).toBeInTheDocument();
    expect(screen.getByText('确认新密码')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入当前密码')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入新密码（至少 6 位）')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请再次输入新密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /确认修改/ })).toBeInTheDocument();
  });

  it('should fail HTML5 validation when fields are empty', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordPage />, { wrapper: createWrapper(true) });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /确认修改/ })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /确认修改/ });
    await user.click(submitButton);

    const oldPasswordInput = screen.getByPlaceholderText('请输入当前密码');
    expect(oldPasswordInput).toBeInvalid();
  });

  it('should show error when new password is too short', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordPage />, { wrapper: createWrapper(true) });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('请输入当前密码')).toBeInTheDocument();
    });

    const oldPasswordInput = screen.getByPlaceholderText('请输入当前密码');
    const newPasswordInput = screen.getByPlaceholderText('请输入新密码（至少 6 位）');
    const confirmPasswordInput = screen.getByPlaceholderText('请再次输入新密码');
    const submitButton = screen.getByRole('button', { name: /确认修改/ });

    await user.type(oldPasswordInput, 'oldpass');
    await user.type(newPasswordInput, '123');
    await user.type(confirmPasswordInput, '123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('新密码长度不能少于 6 位')).toBeInTheDocument();
    });
  });

  it('should show error when new passwords do not match', async () => {
    const user = userEvent.setup();
    render(<ChangePasswordPage />, { wrapper: createWrapper(true) });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('请输入当前密码')).toBeInTheDocument();
    });

    const oldPasswordInput = screen.getByPlaceholderText('请输入当前密码');
    const newPasswordInput = screen.getByPlaceholderText('请输入新密码（至少 6 位）');
    const confirmPasswordInput = screen.getByPlaceholderText('请再次输入新密码');
    const submitButton = screen.getByRole('button', { name: /确认修改/ });

    await user.type(oldPasswordInput, 'oldpass');
    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'differentpass');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('两次输入的新密码不一致')).toBeInTheDocument();
    });
  });

  it('should successfully submit password and redirect on success', async () => {
    const user = userEvent.setup();
    vi.mocked(userApi.changePassword).mockResolvedValue(undefined);

    render(<ChangePasswordPage />, { wrapper: createWrapper(true) });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('请输入当前密码')).toBeInTheDocument();
    });

    const oldPasswordInput = screen.getByPlaceholderText('请输入当前密码');
    const newPasswordInput = screen.getByPlaceholderText('请输入新密码（至少 6 位）');
    const confirmPasswordInput = screen.getByPlaceholderText('请再次输入新密码');
    const submitButton = screen.getByRole('button', { name: /确认修改/ });

    await user.type(oldPasswordInput, 'oldpass');
    await user.type(newPasswordInput, 'newpass123');
    await user.type(confirmPasswordInput, 'newpass123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(vi.mocked(userApi.changePassword).mock.calls[0][0]).toEqual({
        oldPassword: 'oldpass',
        newPassword: 'newpass123',
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should show API error on submission failure', async () => {
    const user = userEvent.setup();
    vi.mocked(userApi.changePassword).mockRejectedValue({
      response: { data: { message: '旧密码输入错误' } },
    });

    render(<ChangePasswordPage />, { wrapper: createWrapper(true) });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('请输入当前密码')).toBeInTheDocument();
    });

    const oldPasswordInput = screen.getByPlaceholderText('请输入当前密码');
    const newPasswordInput = screen.getByPlaceholderText('请输入新密码（至少 6 位）');
    const confirmPasswordInput = screen.getByPlaceholderText('请再次输入新密码');
    const submitButton = screen.getByRole('button', { name: /确认修改/ });

    await user.type(oldPasswordInput, 'wrongoldpass');
    await user.type(newPasswordInput, 'newpass123');
    await user.type(confirmPasswordInput, 'newpass123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('旧密码输入错误')).toBeInTheDocument();
    });
  });
});
