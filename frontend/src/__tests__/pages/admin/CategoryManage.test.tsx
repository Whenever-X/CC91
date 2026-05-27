import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../context/AuthContext';
import CategoryManage from '../../../pages/admin/CategoryManage';
import * as categoryApi from '../../../api/category';

vi.mock('../../../api/category');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockNavigate,
}));

describe('CategoryManage', () => {
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

  const mockCategories = [
    { id: 1, name: 'Tech', description: 'Technology board', sortOrder: 1 },
    { id: 2, name: 'Life', description: 'Daily life', sortOrder: 2 },
  ];

  const setupMocks = () => {
    vi.mocked(categoryApi.getCategories).mockResolvedValue(mockCategories as any);
  };

  it('renders category list with names', async () => {
    setupMocks();

    render(<CategoryManage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Tech')).toBeInTheDocument();
    });

    expect(screen.getByText('Life')).toBeInTheDocument();
  });

  it('click "新建版块" shows the form', async () => {
    const user = userEvent.setup();
    setupMocks();

    render(<CategoryManage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Tech')).toBeInTheDocument();
    });

    // Form should not be visible initially
    expect(screen.queryByLabelText(/版块名称/)).toBeNull();

    // Click the button to show the form
    await user.click(screen.getByText('+ 新建版块'));

    // After click, the form heading should appear
    expect(screen.getByRole('heading', { name: '新建版块' })).toBeInTheDocument();
    expect(screen.getByLabelText(/版块名称/)).toBeInTheDocument();
  });

  it('create category form submission calls createCategory', async () => {
    const user = userEvent.setup();
    setupMocks();
    vi.mocked(categoryApi.createCategory).mockResolvedValue({
      id: 3, name: 'NewCat', description: 'New', sortOrder: 2, createdAt: '2026-01-01T00:00:00',
    });

    render(<CategoryManage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Tech')).toBeInTheDocument();
    });

    // Open form
    await user.click(screen.getByText('+ 新建版块'));

    // Fill in the form
    const nameInput = screen.getByLabelText(/版块名称/);
    await user.type(nameInput, 'NewCat');

    // Submit
    await user.click(screen.getByRole('button', { name: '创建' }));

    await waitFor(() => {
      expect(categoryApi.createCategory).toHaveBeenCalled();
    });
  });

  it('delete category calls deleteCategory after confirm', async () => {
    const user = userEvent.setup();
    setupMocks();
    vi.mocked(categoryApi.deleteCategory).mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CategoryManage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Tech')).toBeInTheDocument();
    });

    // Find all delete buttons and click the first one
    const deleteButtons = screen.getAllByText('删除');
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(categoryApi.deleteCategory).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ client: expect.anything() })
      );
    });
  });

  it('shows error on delete mutation failure', async () => {
    const user = userEvent.setup();
    setupMocks();
    vi.mocked(categoryApi.deleteCategory).mockRejectedValueOnce({
      response: { data: { message: '删除版块失败' } },
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CategoryManage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Tech')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('删除');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('删除版块失败')).toBeInTheDocument();
    });
  });
});
