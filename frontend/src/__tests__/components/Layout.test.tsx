import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../../components/Layout';

// Mock child components to simplify testing
vi.mock('../../components/Header', () => ({
  default: () => <header data-testid="mock-header">Header Mock</header>,
}));

vi.mock('../../components/Footer', () => ({
  default: () => <footer data-testid="mock-footer">Footer Mock</footer>,
}));

vi.mock('../../components/MockBanner', () => ({
  default: () => <div data-testid="mock-banner">MockBanner</div>,
}));

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderLayout = (children: React.ReactNode = <div>Test Content</div>) => {
    return render(
      <MemoryRouter initialEntries={['/']}>
        <Layout>{children}</Layout>
      </MemoryRouter>
    );
  };

  it('应渲染 Header 组件', () => {
    renderLayout();

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });

  it('应渲染 Footer 组件', () => {
    renderLayout();

    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });

  it('应渲染 MockBanner 组件', () => {
    renderLayout();

    expect(screen.getByTestId('mock-banner')).toBeInTheDocument();
  });

  it('应渲染子组件内容', () => {
    renderLayout(<div data-testid="child-content">子内容</div>);

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('子内容')).toBeInTheDocument();
  });

  it('应包含跳转到主内容的跳过链接', () => {
    renderLayout();

    const skipLink = screen.getByText('跳转到主要内容');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('应包含 main 元素作为内容区域', () => {
    renderLayout();

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main-content');
  });

  it('应应用主题 class 到 body', () => {
    renderLayout();

    // 默认主题应为 classic
    expect(document.body.classList.contains('theme-classic')).toBe(true);
  });
});
