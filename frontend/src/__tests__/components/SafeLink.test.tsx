import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SafeLink from '../../components/SafeLink';

describe('SafeLink', () => {
  it('should render as React Router Link when inside router context', () => {
    render(
      <MemoryRouter>
        <SafeLink to="/about">About Page</SafeLink>
      </MemoryRouter>
    );
    const link = screen.getByText('About Page');
    // React Router Link renders an <a> tag with the href
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/about');
  });

  it('should render as a plain anchor when outside router context', () => {
    render(<SafeLink to="https://example.com">External Link</SafeLink>);
    const link = screen.getByText('External Link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('should pass through extra HTML attributes', () => {
    render(
      <MemoryRouter>
        <SafeLink to="/test" className="custom-class" target="_blank" rel="noreferrer">
          Test Link
        </SafeLink>
      </MemoryRouter>
    );
    const link = screen.getByText('Test Link');
    expect(link).toHaveClass('custom-class');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('should render as plain anchor with rel for external links outside router', () => {
    render(
      <SafeLink to="https://external.com" rel="noreferrer">
        External
      </SafeLink>
    );
    const link = screen.getByText('External');
    expect(link).toHaveAttribute('href', 'https://external.com');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('should handle object-style to prop outside router', () => {
    render(
      <SafeLink to={{ pathname: '/some/path', search: '?q=test' }}>
        Object Link
      </SafeLink>
    );
    const link = screen.getByText('Object Link');
    expect(link).toHaveAttribute('href', '/some/path');
  });
});
