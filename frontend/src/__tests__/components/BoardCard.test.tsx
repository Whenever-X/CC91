import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BoardCard from '../../components/BoardCard';
import type { Category } from '../../api/category';

describe('BoardCard', () => {
  const baseCategory: Category = {
    id: 1,
    name: '技术交流',
    description: '讨论各种技术话题',
    sortOrder: 0,
    createdAt: '2024-01-01T00:00:00',
    postCount: 128,
    todayPostCount: 5,
  };

  it('should render the board name', () => {
    render(<BoardCard category={baseCategory} />);
    expect(screen.getByText('技术交流')).toBeInTheDocument();
  });

  it('should render the board description', () => {
    render(<BoardCard category={baseCategory} />);
    expect(screen.getByText('讨论各种技术话题')).toBeInTheDocument();
  });

  it('should render post count stats', () => {
    render(<BoardCard category={baseCategory} />);
    expect(screen.getByText('128 贴')).toBeInTheDocument();
    // The stats row contains "主题: 128" and "今日: 5"
    expect(screen.getByText('128')).toBeInTheDocument();
  });

  it('should render today post count', () => {
    render(<BoardCard category={baseCategory} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render fallback description when description is empty', () => {
    const noDescCategory = { ...baseCategory, description: '' };
    render(<BoardCard category={noDescCategory} />);
    expect(screen.getByText('暂无描述。')).toBeInTheDocument();
  });

  it('should call onClick with board id when clicked', () => {
    const onClick = vi.fn();
    render(<BoardCard category={baseCategory} onClick={onClick} />);
    fireEvent.click(screen.getByText('技术交流'));
    expect(onClick).toHaveBeenCalledWith(1);
  });

  it('should not crash when onClick is not provided', () => {
    render(<BoardCard category={baseCategory} />);
    const card = screen.getByText('技术交流').closest('.cc98-board-card')!;
    expect(card).toBeInTheDocument();
    fireEvent.click(card);
    // No error should be thrown
  });
});
