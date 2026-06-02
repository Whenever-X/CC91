import { useState, useEffect, type FormEvent } from 'react';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => Promise<void>;
  isSubmitting?: boolean;
  contentType: 'POST' | 'COMMENT';
}

const REASONS = [
  '垃圾广告',
  '违法违规',
  '人身攻击',
  '其他'
];

export default function ReportDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  contentType
}: ReportDialogProps) {
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Reset state when open status changes
  useEffect(() => {
    if (isOpen) {
      setReason(REASONS[0]);
      setDescription('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await onSubmit(reason, description.trim());
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || '提交举报失败，请重试');
    }
  };

  return (
    <div className="cc98-modal-overlay" onClick={onClose}>
      <div 
        className="cc98-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', width: '90%' }}
      >
        <div className="cc98-modal-header">
          <h3>
            <i className="fa fa-flag" style={{ color: '#fb6165', marginRight: '0.5rem' }}></i>
            举报{contentType === 'POST' ? '帖子' : '评论'}
          </h3>
          <button className="cc98-modal-close" onClick={onClose} aria-label="关闭">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="cc98-modal-body">
          {error && (
            <div className="cc98-error-box" style={{ marginBottom: '1rem' }}>
              <i className="fa fa-exclamation-circle"></i> {error}
            </div>
          )}

          <div className="cc98-form-group">
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
              请选择举报原因 <span style={{ color: '#fb6165' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {REASONS.map((r) => (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.92rem' }}>
                  <input
                    type="radio"
                    name="report-reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    disabled={isSubmitting}
                    style={{ cursor: 'pointer' }}
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <div className="cc98-form-group" style={{ marginTop: '1rem' }}>
            <label htmlFor="report-description" style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
              举报描述 (选填)
            </label>
            <textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入举报的详细理由，帮助管理员更快处理..."
              disabled={isSubmitting}
              className="cc98-form-control"
              maxLength={200}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.6rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-main)',
                borderRadius: 'var(--cc98-radius)',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                resize: 'vertical'
              }}
            />
            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {description.length}/200
            </div>
          </div>

          <div className="cc98-modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="cc98-edit-cancel-btn"
              disabled={isSubmitting}
              style={{ padding: '0.5rem 1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--cc98-radius-pill)' }}
            >
              取消
            </button>
            <button
              type="submit"
              className="cc98-reply-submit-btn"
              disabled={isSubmitting}
              style={{
                backgroundColor: '#fb6165',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1.5rem',
                borderRadius: 'var(--cc98-radius-pill)',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {isSubmitting ? '提交中...' : '提交举报'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .cc98-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease-out;
        }

        .cc98-modal-content {
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--cc98-radius);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          animation: slideUp 0.2s ease-out;
        }

        .cc98-modal-header {
          background-color: var(--primary-color);
          color: white;
          padding: 0.85rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid var(--accent-color);
        }

        .theme-dark .cc98-modal-header {
          border-bottom-color: var(--border-color);
        }

        .cc98-modal-header h3 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: bold;
          display: flex;
          align-items: center;
        }

        .cc98-modal-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0.8;
          transition: var(--cc98-transition);
          line-height: 1;
        }

        .cc98-modal-close:hover {
          opacity: 1;
        }

        .cc98-modal-body {
          padding: 1.25rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
