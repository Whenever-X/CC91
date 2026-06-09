import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

// Suppress console.error for expected errors in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

function ThrowingComponent(): never {
  throw new Error('Test error');
}

function StableComponent() {
  return <div>Stable Content</div>;
}

describe('ErrorBoundary', () => {
  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <StableComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Stable Content')).toBeInTheDocument();
  });

  it('should show fallback UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('页面出错了')).toBeInTheDocument();
    expect(screen.getByText('很抱歉，页面遇到了意外错误。请尝试刷新页面。')).toBeInTheDocument();
    expect(screen.getByText('刷新页面')).toBeInTheDocument();
    expect(screen.queryByText('Stable Content')).not.toBeInTheDocument();
  });

  it('should render custom fallback when provided and error occurs', () => {
    render(
      <ErrorBoundary fallback={<div>Custom Error UI</div>}>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    expect(screen.queryByText('页面出错了')).not.toBeInTheDocument();
  });

  it('should have role="alert" on default error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
