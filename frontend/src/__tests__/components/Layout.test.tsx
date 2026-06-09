import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock AuthContext used by Header
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    logout: vi.fn(),
  }),
}));

// Mock NotificationBell
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

import Layout from '../../components/Layout';

describe('Layout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render children', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Test Child Content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  it('should include Header and Footer', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    );

    // Header renders site title link
    expect(screen.getByText('CC91 论坛')).toBeInTheDocument();
    // Footer renders copyright
    expect(screen.getByText(/CC91 论坛\. 版权所有\./)).toBeInTheDocument();
  });

  it('should have a main content area with correct id', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(document.getElementById('main-content')).toBeInTheDocument();
  });
});
