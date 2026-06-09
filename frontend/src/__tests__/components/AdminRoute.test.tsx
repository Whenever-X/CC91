import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminRoute from '../../components/AdminRoute';

describe('AdminRoute', () => {
  it('should show 403 page when isAdmin is false', () => {
    render(
      <AdminRoute isAdmin={false}>
        <div>Admin Panel</div>
      </AdminRoute>
    );

    expect(screen.getByText('403 - 禁止访问')).toBeInTheDocument();
    expect(screen.getByText('您没有权限访问管理后台')).toBeInTheDocument();
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('should render children when isAdmin is true', () => {
    render(
      <AdminRoute isAdmin={true}>
        <div>Admin Panel</div>
      </AdminRoute>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.queryByText('403 - 禁止访问')).not.toBeInTheDocument();
  });
});
