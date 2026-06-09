import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MockBanner from '../../components/MockBanner';

// Mock window.location.reload via spyOn before any test runs
const reloadMock = vi.fn();
vi.stubGlobal('location', { ...window.location, reload: reloadMock });

describe('MockBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    reloadMock.mockClear();
  });

  it('should display mock mode banner when use_mock is true', () => {
    localStorage.setItem('use_mock', 'true');
    render(<MockBanner />);
    expect(screen.getByText(/当前正使用 Mock 数据模式/)).toBeInTheDocument();
  });

  it('should display connect to backend button when in mock mode', () => {
    localStorage.setItem('use_mock', 'true');
    render(<MockBanner />);
    expect(screen.getByText(/连接真实后端/)).toBeInTheDocument();
  });

  it('should display live mode indicator when use_mock is not set', () => {
    render(<MockBanner />);
    expect(screen.getByText(/连接真实后端/)).toBeInTheDocument();
    expect(screen.getByText(/点击切换 Mock/)).toBeInTheDocument();
  });

  it('should not display mock banner when use_mock is false', () => {
    localStorage.setItem('use_mock', 'false');
    render(<MockBanner />);
    // Should show the live mode floating button, not the mock banner
    expect(screen.queryByText(/当前正使用 Mock 数据模式/)).not.toBeInTheDocument();
    expect(screen.getByText(/连接真实后端/)).toBeInTheDocument();
  });

  it('should clear use_mock and reload when clicking connect to live button', () => {
    localStorage.setItem('use_mock', 'true');
    render(<MockBanner />);
    const button = screen.getByRole('button', { name: /连接真实后端/ });
    button.click();
    expect(localStorage.getItem('use_mock')).toBeNull();
    expect(reloadMock).toHaveBeenCalled();
  });
});
