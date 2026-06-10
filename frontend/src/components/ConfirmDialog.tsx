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
    <div className="cc98-confirm-overlay" onClick={onCancel}>
      <div
        className="cc98-confirm-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cc98-confirm-header">
          <h3>{title}</h3>
        </div>

        <div className="cc98-confirm-body">
          <p className="cc98-confirm-message">{message}</p>

          <div className="cc98-confirm-actions">
            <button
              className="cc98-confirm-btn cc98-confirm-btn-cancel"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </button>
            <button
              ref={confirmBtnRef}
              className={`cc98-confirm-btn ${confirmBtnClass}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? '处理中...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        /* ===== Overlay 遮罩层 ===== */
        .cc98-confirm-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          animation: cc98-overlay-in 0.15s ease-out;
        }
        @keyframes cc98-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ===== Panel 面板 ===== */
        .cc98-confirm-panel {
          background: var(--card-bg, #fff);
          border-radius: 12px;
          box-shadow:
            0 4px 24px rgba(0, 0, 0, 0.18),
            0 0 0 1px rgba(0, 0, 0, 0.06);
          max-width: 420px;
          width: 90vw;
          overflow: hidden;
          animation: cc98-panel-in 0.2s ease-out;
        }
        @keyframes cc98-panel-in {
          from { opacity: 0; transform: scale(0.95) translateY(-8px); }
          to   { opacity: 1; transform: scale(1)     translateY(0); }
        }

        /* ===== Header ===== */
        .cc98-confirm-header {
          padding: 1rem 1.5rem;
          background: var(--primary-color, #336699);
          color: #fff;
          font-size: 1.05rem;
          font-weight: 600;
        }
        .cc98-confirm-header h3 {
          margin: 0;
          font-size: inherit;
        }

        /* ===== Body ===== */
        .cc98-confirm-body {
          padding: 1.5rem;
        }
        .cc98-confirm-message {
          margin: 0 0 1.5rem 0;
          line-height: 1.65;
          color: var(--text-main, #333);
          font-size: 0.95rem;
        }

        /* ===== Actions ===== */
        .cc98-confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        /* ===== Buttons ===== */
        .cc98-confirm-btn {
          padding: 0.45rem 1.4rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, opacity 0.15s;
          border: none;
        }
        .cc98-confirm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .cc98-confirm-btn-cancel {
          background: transparent;
          color: var(--text-main, #333);
          border: 1px solid var(--border-color, #d1d5db);
        }
        .cc98-confirm-btn-cancel:hover:not(:disabled) {
          background: var(--quote-bg, #f3f4f6);
        }
        .cc98-confirm-btn-primary {
          background-color: var(--primary-color, #336699);
          color: #fff;
        }
        .cc98-confirm-btn-primary:hover:not(:disabled) {
          filter: brightness(1.1);
        }
        .cc98-confirm-btn-danger {
          background-color: #e74c3c;
          color: #fff;
        }
        .cc98-confirm-btn-danger:hover:not(:disabled) {
          background-color: #c0392b;
        }
        .cc98-confirm-btn-warning {
          background-color: #f39c12;
          color: #fff;
        }
        .cc98-confirm-btn-warning:hover:not(:disabled) {
          background-color: #e67e22;
        }
      `}</style>
    </div>
  );
}
