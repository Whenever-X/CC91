import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs';

describe('Breadcrumbs', () => {
  const renderWithRouter = (items: Parameters<typeof Breadcrumbs>[0]['items']) => {
    return render(
      <MemoryRouter>
        <Breadcrumbs items={items} />
      </MemoryRouter>
    );
  };

  it('should render the home link', () => {
    renderWithRouter([]);
    expect(screen.getByText('首页')).toBeInTheDocument();
  });

  it('should render breadcrumb items with labels', () => {
    renderWithRouter([
      { label: '技术交流', href: '/category/1' },
      { label: '帖子详情' },
    ]);
    expect(screen.getByText('技术交流')).toBeInTheDocument();
    expect(screen.getByText('帖子详情')).toBeInTheDocument();
  });

  it('should render items with href as links', () => {
    renderWithRouter([{ label: '版块列表', href: '/categories' }]);
    const link = screen.getByText('版块列表').closest('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/categories');
  });

  it('should render items without href as plain text', () => {
    renderWithRouter([{ label: '当前页面' }]);
    const span = screen.getByText('当前页面');
    expect(span.tagName).toBe('SPAN');
    expect(span).toHaveClass('cc98-breadcrumb-current');
  });

  it('should render separator icons between items', () => {
    const { container } = render(
      <MemoryRouter>
        <Breadcrumbs items={[{ label: 'A' }, { label: 'B' }]} />
      </MemoryRouter>
    );
    const separators = container.querySelectorAll('.cc98-breadcrumb-sep');
    expect(separators.length).toBe(2);
  });
});
