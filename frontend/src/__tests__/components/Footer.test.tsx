import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../../components/Footer';

describe('Footer', () => {
  const renderFooter = () => {
    return render(<Footer />);
  };

  it('应显示版权信息', () => {
    renderFooter();

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`${currentYear}.*CC91.*论坛.*版权所有`))
    ).toBeInTheDocument();
  });

  it('应显示论坛数据统计', () => {
    renderFooter();

    expect(screen.getByText(/今日帖数/)).toBeInTheDocument();
    expect(screen.getByText(/昨日帖数/)).toBeInTheDocument();
    expect(screen.getByText(/最高日帖数/)).toBeInTheDocument();
    expect(screen.getByText(/论坛主题/)).toBeInTheDocument();
    expect(screen.getByText(/总帖数/)).toBeInTheDocument();
    expect(screen.getByText(/注册会员/)).toBeInTheDocument();
  });

  it('应显示友情链接', () => {
    renderFooter();

    expect(screen.getByText('关于我们')).toBeInTheDocument();
    expect(screen.getByText('浙江大学')).toBeInTheDocument();
    expect(screen.getByText('联系管理员')).toBeInTheDocument();
    expect(screen.getByText('论坛条例')).toBeInTheDocument();
  });

  it('"浙江大学"链接应包含安全属性', () => {
    renderFooter();

    const zjuLink = screen.getByText('浙江大学');
    expect(zjuLink).toHaveAttribute('target', '_blank');
    expect(zjuLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('应显示 Powered by 信息', () => {
    renderFooter();

    expect(
      screen.getByText(/Powered by React \+ Spring Boot/)
    ).toBeInTheDocument();
  });

  it('应包含统计数值', () => {
    renderFooter();

    // 检查数据统计区有数值显示
    expect(screen.getByText('124')).toBeInTheDocument();
    expect(screen.getByText('482')).toBeInTheDocument();
  });
});
