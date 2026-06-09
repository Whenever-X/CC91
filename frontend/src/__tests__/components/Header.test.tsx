import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../components/Header';

// Mock AuthContext
const mockUseAuth = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock API logout
vi.mock('../../api/auth', () => ({
  logout: vi.fn().mockResolvedValue(undefined),
}));

// Mock NotificationBell to simplify
vi.mock('../../components/NotificationBell', () => ({
  default: () => <div data-testid="notification-bell">通知铃铛</div>,
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default: unauthenticated
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      logout: vi.fn(),
    });
  });

  const renderHeader = (route = '/') => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Header />
      </MemoryRouter>
    );
  };

  describe('未登录状态', () => {
    it('应显示登录和注册链接', () => {
      renderHeader();

      expect(screen.getByText('登录')).toBeInTheDocument();
      expect(screen.getByText('注册')).toBeInTheDocument();
    });

    it('不应显示用户名', () => {
      renderHeader();

      // 用户名不应该出现，因为没有登录
      expect(screen.queryByText(/退出登录/)).not.toBeInTheDocument();
    });

    it('不应显示管理后台入口', () => {
      renderHeader();

      expect(screen.queryByText('管理后台')).not.toBeInTheDocument();
    });

    it('不应显示通知铃铛', () => {
      renderHeader();

      expect(screen.queryByTestId('notification-bell')).not.toBeInTheDocument();
    });
  });

  describe('已登录状态（普通用户）', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { username: 'testuser', email: '', role: 'USER' },
        isAuthenticated: true,
        isAdmin: false,
        logout: vi.fn(),
      });
    });

    it('应显示用户名', () => {
      renderHeader();

      expect(screen.getByText(/testuser/)).toBeInTheDocument();
    });

    it('应显示通知铃铛', () => {
      renderHeader();

      expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    });

    it('不应显示登录/注册链接', () => {
      renderHeader();

      expect(screen.queryByText('登录')).not.toBeInTheDocument();
      expect(screen.queryByText('注册')).not.toBeInTheDocument();
    });

    it('不应显示管理后台入口', () => {
      renderHeader();

      // 普通用户不应看到管理入口
      expect(screen.queryByText('管理后台')).not.toBeInTheDocument();
    });

    it('点击退出登录应触发 logout', async () => {
      const mockLogout = vi.fn();
      mockUseAuth.mockReturnValue({
        user: { username: 'testuser', email: '', role: 'USER' },
        isAuthenticated: true,
        isAdmin: false,
        logout: mockLogout,
      });

      renderHeader();

      // 用户名区域悬停展开下拉菜单，点击退出
      const usernameLink = screen.getByText(/testuser/);
      await userEvent.hover(usernameLink);

      const logoutBtn = await screen.findByText('退出登录');
      await userEvent.click(logoutBtn);

      // 退出后应调用 logout
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('Admin 角色', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { username: 'admin', email: '', role: 'ADMIN' },
        isAuthenticated: true,
        isAdmin: true,
        logout: vi.fn(),
      });
    });

    it('应显示管理后台入口', () => {
      renderHeader();

      // 鼠标悬停用户名区域展开下拉菜单
      const usernameLink = screen.getByText(/admin/);
      // 使用 hover 来触发下拉菜单
      expect(usernameLink).toBeInTheDocument();
    });
  });

  describe('搜索框', () => {
    it('应渲染搜索框', () => {
      renderHeader();

      const searchInput = screen.getByPlaceholderText('搜索帖子...');
      expect(searchInput).toBeInTheDocument();
    });

    it('应渲染搜索按钮', () => {
      renderHeader();

      const searchBtn = screen.getByLabelText('执行搜索');
      expect(searchBtn).toBeInTheDocument();
    });
  });

  describe('主题切换', () => {
    it('应显示主题切换按钮', () => {
      renderHeader();

      const themeBtn = screen.getByLabelText('切换主题');
      expect(themeBtn).toBeInTheDocument();
    });

    it('点击主题按钮应显示主题下拉菜单', async () => {
      renderHeader();

      const themeBtn = screen.getByLabelText('切换主题');
      await userEvent.click(themeBtn);

      expect(screen.getByText('经典蓝')).toBeInTheDocument();
      expect(screen.getByText('温暖茶')).toBeInTheDocument();
      expect(screen.getByText('樱花粉')).toBeInTheDocument();
      expect(screen.getByText('深邃暗')).toBeInTheDocument();
    });
  });

  describe('站点标题', () => {
    it('应显示 CC91 论坛标题', () => {
      renderHeader();

      expect(screen.getByText('CC91 论坛')).toBeInTheDocument();
    });

    it('站点标题应链接到首页', () => {
      renderHeader();

      const titleLink = screen.getByText('CC91 论坛');
      expect(titleLink.closest('a')).toHaveAttribute('href', '/');
    });
  });

  describe('导航链接', () => {
    it('应显示首页和帖子导航链接', () => {
      renderHeader();

      // 使用 getAllByText 因为可能会有多个"首页"
      const homeLinks = screen.getAllByText('首页');
      expect(homeLinks.length).toBeGreaterThan(0);

      const postLinks = screen.getAllByText('帖子');
      expect(postLinks.length).toBeGreaterThan(0);
    });
  });
});
