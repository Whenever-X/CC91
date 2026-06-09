import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BoardCard from '../../components/BoardCard';
import type { Category } from '../../api/category';

describe('BoardCard', () => {
  const mockCategory: Category = {
    id: 1,
    name: '技术交流',
    description: '编程、算法与技术讨论',
    sortOrder: 1,
    createdAt: '2025-01-01T00:00:00Z',
    postCount: 128,
    todayPostCount: 15,
  };

  const renderBoardCard = (category = mockCategory, onClick?: (id: number) => void) => {
    return render(<BoardCard category={category} onClick={onClick} />);
  };

  it('应显示版块名称', () => {
    renderBoardCard();

    expect(screen.getByText('技术交流')).toBeInTheDocument();
  });

  it('应显示版块描述', () => {
    renderBoardCard();

    expect(screen.getByText('编程、算法与技术讨论')).toBeInTheDocument();
  });

  it('应显示帖子统计（主题数）', () => {
    renderBoardCard();

    expect(screen.getByText('128')).toBeInTheDocument();
  });

  it('应显示今日帖子数', () => {
    renderBoardCard();

    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('应显示帖子总数 badge', () => {
    renderBoardCard();

    expect(screen.getByText('128 贴')).toBeInTheDocument();
  });

  it('无描述时应显示默认文本', () => {
    const catWithoutDesc = { ...mockCategory, description: '' };
    renderBoardCard(catWithoutDesc);

    expect(screen.getByText('暂无描述。')).toBeInTheDocument();
  });

  it('点击应触发 onClick 回调并传入版块 ID', async () => {
    const handleClick = vi.fn();
    renderBoardCard(mockCategory, handleClick);

    const card = screen.getByText('技术交流').closest('.cc98-board-card');
    expect(card).toBeInTheDocument();

    if (card) {
      await userEvent.click(card);
    }

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(1);
  });

  it('应渲染 Font Awesome 图标', () => {
    renderBoardCard();

    // id=1 → fa-heartbeat
    const icon = document.querySelector('.cc98-board-icon i');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('fa-heartbeat');
  });

  it('不同 ID 应渲染不同图标', () => {
    const cat2 = { ...mockCategory, id: 2 };
    const { unmount } = renderBoardCard(cat2);

    // id=2 → fa-gamepad
    const icon = document.querySelector('.cc98-board-icon i');
    expect(icon).toHaveClass('fa-gamepad');

    unmount();
  });
});
