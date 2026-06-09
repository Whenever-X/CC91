import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock NotificationBell since it has its own API calls
vi.mock('../../components/NotificationBell', () => ({
  default: () => <div data-testid="notification-bell">Bell</div>,
}));

// Mock image imports
vi.mock('../../assets/cc98_banner.png', () => ({
  default: 'banner.png',
}));
vi.mock('../../assets/cc98_avatar_cat.png', () => ({
  default: 'cat-avatar.png',
}));

// Mock auth API
vi.mock('../../api/auth', () => ({
  logout: vi.fn(),
}));

import Header from '../../components/Header';

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show login and register links when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText('登录')).toBeInTheDocument();
    expect(screen.getByText('注册')).toBeInTheDocument();
  });

  it('should show username when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { username: 'zhangsan', email: 'zhangsan@test.com' },
      isAuthenticated: true,
      isAdmin: false,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText(/zhangsan/)).toBeInTheDocument();
    expect(screen.queryByText('登录')).not.toBeInTheDocument();
    expect(screen.queryByText('注册')).not.toBeInTheDocument();
  });

  it('should show site title link', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText('CC91 论坛')).toBeInTheDocument();
  });
});
