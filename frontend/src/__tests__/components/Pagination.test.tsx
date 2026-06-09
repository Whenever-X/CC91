import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from '../../components/Pagination';

describe('Pagination', () => {
  it('should display page numbers correctly', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />
    );

    // With delta=2 and currentPage=2 (0-indexed), all pages 0-4 are visible
    // Pages are 0-indexed internally, displayed as 1-indexed
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Page info shows "第 3 / 5 页" (currentPage=2 -> display 3)
    expect(screen.getByText(/第 3 \/ 5 页/)).toBeInTheDocument();
  });

  it('should trigger callback when clicking next page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={0} totalPages={5} onPageChange={onPageChange} />
    );

    const nextButton = screen.getByTitle('下一页');
    await user.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('should disable "上一页" button on first page', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={0} totalPages={5} onPageChange={onPageChange} />
    );

    const prevButton = screen.getByTitle('上一页');
    expect(prevButton).toBeDisabled();

    // First page button should also be disabled
    const firstButton = screen.getByTitle('第一页');
    expect(firstButton).toBeDisabled();
  });

  it('should disable "下一页" button on last page', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={4} totalPages={5} onPageChange={onPageChange} />
    );

    const nextButton = screen.getByTitle('下一页');
    expect(nextButton).toBeDisabled();

    const lastButton = screen.getByTitle('最后一页');
    expect(lastButton).toBeDisabled();
  });

  it('should not render when totalPages <= 1', () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <Pagination currentPage={0} totalPages={1} onPageChange={onPageChange} />
    );

    expect(container.innerHTML).toBe('');
  });

  it('should highlight active page', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />
    );

    const activeButton = screen.getByText('3'); // page 2 displayed as 3
    expect(activeButton.classList.contains('active')).toBe(true);
  });
});
