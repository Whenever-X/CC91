import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  variant = 'default',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && confirmBtnRef.current) {
      confirmBtnRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmBtnClass =
    variant === 'danger'
      ? 'cc98-confirm-btn-danger'
      : variant === 'warning'
        ? 'cc98-confirm-btn-warning'
        : 'cc98-confirm-btn-primary';

  return (
    <div className="cc98-modal-overlay" onClick={onCancel}>
      <div
        className="cc98-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px', width: '90%' }}
      >
        <div className="cc98-modal-header">
          <h3>{title}</h3>
          <button className="cc98-modal-close" onClick={onCancel} aria-label="关闭">&times;</button>
        </div>

        <div className="cc98-modal-body" style={{ padding: '1.5rem' }}>
          <p style={{ margin: '0 0 1.5rem 0', lineHeight: 1.6, color: 'var(--text-main)' }}>
            {message}
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              className="btn btn-sm"
              onClick={onCancel}
              disabled={isLoading}
              style={{
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--text-main)',
              }}
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmBtnRef}
              className={`btn btn-sm ${confirmBtnClass}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? '处理中...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .cc98-confirm-btn-primary {
          background-color: var(--primary-color);
          color: white;
          border: none;
          padding: 0.4rem 1.25rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .cc98-confirm-btn-primary:hover:not(:disabled) {
          opacity: 0.85;
        }

        .cc98-confirm-btn-danger {
          background-color: #e74c3c;
          color: white;
          border: none;
          padding: 0.4rem 1.25rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .cc98-confirm-btn-danger:hover:not(:disabled) {
          opacity: 0.85;
        }

        .cc98-confirm-btn-warning {
          background-color: #f39c12;
          color: white;
          border: none;
          padding: 0.4rem 1.25rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .cc98-confirm-btn-warning:hover:not(:disabled) {
          opacity: 0.85;
        }

        .cc98-confirm-btn-primary:disabled,
        .cc98-confirm-btn-danger:disabled,
        .cc98-confirm-btn-warning:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
