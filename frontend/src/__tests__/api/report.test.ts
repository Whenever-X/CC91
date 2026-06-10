import { describe, it, expect, vi, beforeEach } from 'vitest';
import client from '../../api/client';
import { adminGetReports, adminHandleReport } from '../../api/report';

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const mockedClient = vi.mocked(client);

describe('report api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unwraps paged admin reports from the real backend response', async () => {
    const reports = [
      {
        id: 1,
        reporterId: 2,
        targetType: 'POST' as const,
        targetId: 3,
        reason: 'SPAM',
        status: 'PENDING' as const,
        createdAt: '2026-01-01T00:00:00',
      },
    ];
    mockedClient.get.mockResolvedValueOnce({ data: { content: reports } });

    await expect(adminGetReports()).resolves.toEqual([
      {
        id: 1,
        reporterId: 2,
        reporterUsername: '用户 #2',
        contentType: 'POST',
        contentId: 3,
        contentTitle: undefined,
        contentBody: '',
        reason: 'SPAM',
        description: undefined,
        status: 'PENDING',
        createdAt: '2026-01-01T00:00:00',
      },
    ]);
    expect(mockedClient.get).toHaveBeenCalledWith('/admin/reports');
  });

  it('keeps array responses compatible with mocks', async () => {
    mockedClient.get.mockResolvedValueOnce({ data: [] });

    await expect(adminGetReports()).resolves.toEqual([]);
  });

  it('sends REVIEWED when dismissing reports', async () => {
    mockedClient.put.mockResolvedValueOnce({ data: { message: '举报已处理' } });

    await adminHandleReport(1, 'REVIEWED');

    expect(mockedClient.put).toHaveBeenCalledWith('/admin/reports/1', { status: 'REVIEWED' });
  });
});
