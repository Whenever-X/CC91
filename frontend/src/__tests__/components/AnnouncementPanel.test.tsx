import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AnnouncementPanel from '../../components/AnnouncementPanel';
import type { Announcement } from '../../api/announcement';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AnnouncementPanel', () => {
  const baseAnnouncement: Announcement = {
    id: 1,
    title: '系统维护公告',
    content: '系统将于今晚进行维护',
    authorId: 1,
    authorUsername: 'admin',
    isPinned: false,
    createdAt: '2024-06-01T10:00:00',
    updatedAt: '2024-06-01T10:00:00',
  };

  const renderWithRouter = (announcements: Announcement[]) => {
    return render(
      <MemoryRouter>
        <AnnouncementPanel announcements={announcements} />
      </MemoryRouter>
    );
  };

  it('should render the section title', () => {
    renderWithRouter([baseAnnouncement]);
    expect(screen.getByText('全站公告')).toBeInTheDocument();
  });

  it('should render announcement titles', () => {
    renderWithRouter([baseAnnouncement]);
    expect(screen.getByText('系统维护公告')).toBeInTheDocument();
  });

  it('should render multiple announcements', () => {
    const announcements = [
      baseAnnouncement,
      { ...baseAnnouncement, id: 2, title: '新功能上线' },
      { ...baseAnnouncement, id: 3, title: '论坛规则更新' },
    ];
    renderWithRouter(announcements);
    expect(screen.getByText('系统维护公告')).toBeInTheDocument();
    expect(screen.getByText('新功能上线')).toBeInTheDocument();
    expect(screen.getByText('论坛规则更新')).toBeInTheDocument();
  });

  it('should show pinned indicator for pinned announcements', () => {
    const pinnedAnnouncement = { ...baseAnnouncement, isPinned: true };
    renderWithRouter([pinnedAnnouncement]);
    expect(screen.getByText('[置顶]')).toBeInTheDocument();
  });

  it('should not show pinned indicator for non-pinned announcements', () => {
    renderWithRouter([baseAnnouncement]);
    expect(screen.queryByText('[置顶]')).not.toBeInTheDocument();
  });

  it('should show empty message when no announcements', () => {
    renderWithRouter([]);
    expect(screen.getByText('暂无系统公告')).toBeInTheDocument();
  });

  it('should navigate when clicking an announcement', () => {
    renderWithRouter([baseAnnouncement]);
    const link = screen.getByText('系统维护公告').closest('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/announcements/1');
  });
});
