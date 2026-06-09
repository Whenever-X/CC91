import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TopicTable from '../../components/TopicTable';
import type { Post } from '../../api/post';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('TopicTable', () => {
  const basePost: Post = {
    id: 1,
    title: '测试帖子标题',
    content: '帖子内容',
    authorId: 10,
    authorUsername: 'testuser',
    categoryId: 3,
    categoryName: '技术交流',
    status: 'NORMAL',
    createdAt: '2024-06-01T10:00:00',
    updatedAt: '2024-06-01T12:00:00',
    viewCount: 200,
    commentCount: 15,
  };

  const renderWithRouter = (posts?: Post[]) => {
    return render(
      <MemoryRouter>
        <TopicTable posts={posts} />
      </MemoryRouter>
    );
  };

  it('should render column headers', () => {
    renderWithRouter([basePost]);
    expect(screen.getByText('主题标题')).toBeInTheDocument();
    expect(screen.getByText('作者')).toBeInTheDocument();
    expect(screen.getByText('回复/点击')).toBeInTheDocument();
    expect(screen.getByText('最后发表')).toBeInTheDocument();
  });

  it('should render post title', () => {
    renderWithRouter([basePost]);
    expect(screen.getByText('测试帖子标题')).toBeInTheDocument();
  });

  it('should render post author username', () => {
    renderWithRouter([basePost]);
    // The author link renders the username
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('should render category name', () => {
    renderWithRouter([basePost]);
    expect(screen.getByText('[技术交流]')).toBeInTheDocument();
  });

  it('should render reply count and view count', () => {
    renderWithRouter([basePost]);
    // Stats: replyCount / viewCount
    expect(screen.getByTitle('回复数')).toHaveTextContent('15');
    expect(screen.getByTitle('阅读量')).toHaveTextContent('200');
  });

  it('should render empty state when no posts provided', () => {
    renderWithRouter([]);
    expect(screen.getByText('暂无帖子')).toBeInTheDocument();
  });

  it('should render empty state when posts is undefined', () => {
    renderWithRouter(undefined);
    expect(screen.getByText('暂无帖子')).toBeInTheDocument();
  });

  it('should render HOT badge for posts with 15+ replies', () => {
    renderWithRouter([basePost]);
    expect(screen.getByText('HOT')).toBeInTheDocument();
  });

  it('should not render HOT badge for posts with fewer than 15 replies', () => {
    const lowReplyPost = { ...basePost, commentCount: 5 };
    renderWithRouter([lowReplyPost]);
    expect(screen.queryByText('HOT')).not.toBeInTheDocument();
  });

  it('should render sticky status for STICKY posts', () => {
    const stickyPost = { ...basePost, status: 'STICKY' };
    renderWithRouter([stickyPost]);
    expect(screen.getByTitle('置顶主题')).toBeInTheDocument();
  });
});
