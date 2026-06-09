import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../../components/Footer';

describe('Footer', () => {
  it('should display copyright information', () => {
    render(<Footer />);

    expect(screen.getByText(/CC91 论坛\. 版权所有\./)).toBeInTheDocument();
  });

  it('should display "Powered by" text', () => {
    render(<Footer />);

    expect(screen.getByText(/Powered by React \+ Spring Boot\./)).toBeInTheDocument();
  });

  it('should display forum statistics', () => {
    render(<Footer />);

    expect(screen.getByText('今日帖数：')).toBeInTheDocument();
    expect(screen.getByText('论坛主题：')).toBeInTheDocument();
    expect(screen.getByText('注册会员：')).toBeInTheDocument();
  });
});
