import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TopicTable from '../../components/TopicTable';
import type { Post } from '../../api/post';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('TopicTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPosts: Post[] = [
    {
      id: 1,
      title: '欢迎来到 CC91 论坛',
      content: '这是第一篇帖子',
      authorId: 1,
      authorUsername: 'admin',
      categoryId: 1,
      categoryName: '站务',
      status: 'STICKY',
      createdAt: '2025-06-01T10:00:00Z',
      updatedAt: '2025-06-01T10:00:00Z',
      viewCount: 256,
      commentCount: 12,
    },
    {
      id: 2,
      title: 'React 入门教程分享',
      content: 'React 学习笔记',
      authorId: 2,
      authorUsername: 'user',
      categoryId: 2,
      categoryName: '技术',
      status: 'APPROVED',
      createdAt: '2025-06-02T14:30:00Z',
      updatedAt: '2025-06-02T14:30:00Z',
      viewCount: 89,
      commentCount: 5,
    },
    {
      id: 3,
      title: '热门讨论帖',
      content: '热门内容',
      authorId: 3,
      authorUsername: 'editor',
      categoryId: 3,
      categoryName: '灌水',
      status: 'APPROVED',
      createdAt: '2025-06-03T08:00:00Z',
      updatedAt: '2025-06-03T08:00:00Z',
      viewCount: 500,
      commentCount: 20,
    },
  ];

  const renderTopicTable = (posts: Post[] = mockPosts) => {
    return render(
      <MemoryRouter>
        <TopicTable posts={posts} />
      </MemoryRouter>
    );
  };

  describe('基本渲染', () => {
    it('应渲染表格列标题', () => {
      renderTopicTable();

      expect(screen.getByText('主题标题')).toBeInTheDocument();
      expect(screen.getByText('作者')).toBeInTheDocument();
      expect(screen.getByText('回复/点击')).toBeInTheDocument();
      expect(screen.getByText('最后发表')).toBeInTheDocument();
    });

    it('应渲染帖子标题', () => {
      renderTopicTable();

      expect(screen.getByText('欢迎来到 CC91 论坛')).toBeInTheDocument();
      expect(screen.getByText('React 入门教程分享')).toBeInTheDocument();
      expect(screen.getByText('热门讨论帖')).toBeInTheDocument();
    });

    it('应渲染作者用户名', () => {
      renderTopicTable();

      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
      expect(screen.getByText('editor')).toBeInTheDocument();
    });

    it('应渲染版块标签', () => {
      renderTopicTable();

      expect(screen.getByText('[站务]')).toBeInTheDocument();
      expect(screen.getByText('[技术]')).toBeInTheDocument();
      expect(screen.getByText('[灌水]')).toBeInTheDocument();
    });
  });

  describe('状态图标', () => {
    it('置顶帖子应显示图钉图标', () => {
      renderTopicTable();

      const stickyIcon = document.querySelector('.fa-thumb-tack.sticky');
      expect(stickyIcon).toBeInTheDocument();
    });

    it('热门帖子（≥10 回复且非置顶）应显示火焰图标', () => {
      renderTopicTable();

      // 帖子3: 20回复 + APPROVED → 火焰
      // 帖子1: 12回复但 STICKY → 图钉（置顶优先）
      const fireIcons = document.querySelectorAll('.fa-fire.hot');
      expect(fireIcons.length).toBeGreaterThanOrEqual(1);
    });

    it('普通帖子应显示文件图标', () => {
      renderTopicTable();

      // 帖子2: 5回复 → 普通
      const normalIcons = document.querySelectorAll('.fa-file-text-o.normal');
      expect(normalIcons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('HOT 标记', () => {
    it('回复 ≥15 的帖子应显示 HOT 标记', () => {
      renderTopicTable();

      // 帖子3: 20回复
      expect(screen.getByText('HOT')).toBeInTheDocument();
    });
  });

  describe('空列表', () => {
    it('无帖子时应显示空状态提示', () => {
      renderTopicTable([]);

      expect(screen.getByText('暂无帖子')).toBeInTheDocument();
    });
  });

  describe('点击导航', () => {
    it('点击行应导航到帖子详情页', async () => {
      renderTopicTable();

      const row = screen.getByText('欢迎来到 CC91 论坛').closest('tr');
      expect(row).toBeInTheDocument();

      if (row) {
        await userEvent.click(row);
      }

      expect(mockNavigate).toHaveBeenCalledWith('/posts/1');
    });
  });
});
