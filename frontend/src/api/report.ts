import client from './client';
import type { PageResponse } from './post';

function unwrapList<T>(payload: T[] | PageResponse<T>): T[] {
  return Array.isArray(payload) ? payload : payload.content;
}

type ReportContentType = 'POST' | 'COMMENT';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: number;
  reporterId: number;
  reporterUsername: string;
  contentType: ReportContentType;
  contentId: number;
  contentTitle?: string;
  contentBody: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  createdAt: string;
}

interface BackendReport extends Partial<Report> {
  targetType?: ReportContentType;
  targetId?: number;
  adminComment?: string;
}

function normalizeReport(report: BackendReport): Report {
  return {
    id: report.id as number,
    reporterId: report.reporterId as number,
    reporterUsername: report.reporterUsername ?? (
      report.reporterId != null ? `用户 #${report.reporterId}` : '未知用户'
    ),
    contentType: report.contentType ?? report.targetType ?? 'POST',
    contentId: (report.contentId ?? report.targetId) as number,
    contentTitle: report.contentTitle,
    contentBody: report.contentBody ?? '',
    reason: report.reason ?? '',
    description: report.description ?? report.adminComment,
    status: report.status ?? 'PENDING',
    createdAt: report.createdAt ?? '',
  };
}

export interface SubmitReportRequest {
  contentType: 'POST' | 'COMMENT';
  contentId: number;
  reason: string;
  description?: string;
}

/**
 * Submit a report
 * POST /api/reports
 */
export async function submitReport(data: SubmitReportRequest): Promise<Report> {
  const response = await client.post<{ success: boolean; message: string; data: BackendReport }>('/reports', data);
  return normalizeReport(response.data.data);
}

/**
 * Get all reports (admin)
 * GET /api/admin/reports - backend returns Spring Page
 */
export async function adminGetReports(): Promise<Report[]> {
  const response = await client.get<BackendReport[] | PageResponse<BackendReport>>('/admin/reports');
  return unwrapList(response.data).map(normalizeReport);
}

/**
 * Handle a report status
 * PUT /api/admin/reports/{id}
 */
export async function adminHandleReport(id: number, status: 'RESOLVED' | 'REVIEWED'): Promise<void> {
  await client.put(`/admin/reports/${id}`, { status });
}
