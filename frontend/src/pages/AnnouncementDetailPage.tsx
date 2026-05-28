import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAnnouncement } from '../api/announcement';
import { queryKeys } from '../lib/queryKeys';

/**
 * 公告详情页面
 */
export default function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const announcementId = id ? parseInt(id, 10) : 0;
  const isValidId = !isNaN(announcementId) && announcementId > 0;

  const { data: announcement, isLoading, error } = useQuery({
    queryKey: queryKeys.announcements.detail(announcementId),
    queryFn: () => getAnnouncement(announcementId),
    enabled: isValidId,
  });

  if (!isValidId) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text-muted)' }}>链接无效</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            公告 ID 格式不正确
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container" style={{ marginTop: '2rem', textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)' }}>正在载入公告...</p>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text-muted)' }}>公告不存在</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            该公告可能已被删除或链接无效
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: 'var(--link-color)',
          textDecoration: 'none',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
        }}
      >
        &larr; 返回首页
      </Link>

      <div style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--cc98-radius)',
        boxShadow: 'var(--cc98-shadow)',
        borderTop: `8px solid ${announcement.isPinned ? 'var(--cc98-alt-color-a)' : 'var(--border-color)'}`,
        overflow: 'hidden',
      }}>
        <div style={{ padding: '2rem 2.5rem' }}>
          <h1 style={{
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '0.75rem',
            lineHeight: 1.4,
          }}>
            {announcement.isPinned && (
              <span style={{
                display: 'inline-block',
                padding: '0.1rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: '#fef3c7',
                color: '#92400e',
                marginRight: '0.5rem',
                verticalAlign: 'middle',
              }}>
                置顶
              </span>
            )}
            {announcement.title}
          </h1>

          <div style={{
            display: 'flex',
            gap: '1rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            marginBottom: '1.75rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <span>
              <i className="fa fa-user" style={{ marginRight: '0.35rem' }}></i>
              {announcement.authorUsername}
            </span>
            <span>
              <i className="fa fa-clock-o" style={{ marginRight: '0.35rem' }}></i>
              {new Date(announcement.createdAt).toLocaleString('zh-CN')}
            </span>
          </div>

          <div style={{
            color: 'var(--text-main)',
            fontSize: '1rem',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {announcement.content}
          </div>
        </div>
      </div>
    </div>
  );
}
