import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="cc98-toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
      <style>{`
        .cc98-toast-container {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          pointer-events: none;
        }
        .cc98-toast-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          pointer-events: auto;
          animation: cc98-toast-in 0.3s ease-out;
          max-width: 380px;
        }
        .cc98-toast-success {
          background-color: #2ecc71;
        }
        .cc98-toast-error {
          background-color: #e74c3c;
        }
        .cc98-toast-info {
          background-color: var(--primary-color);
        }
        .cc98-toast-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1.1rem;
          padding: 0;
          line-height: 1;
          opacity: 0.8;
          flex-shrink: 0;
        }
        .cc98-toast-close:hover {
          opacity: 1;
        }
        @keyframes cc98-toast-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const typeClass =
    toast.type === 'success'
      ? 'cc98-toast-success'
      : toast.type === 'error'
        ? 'cc98-toast-error'
        : 'cc98-toast-info';

  const icon =
    toast.type === 'success'
      ? 'fa-check-circle'
      : toast.type === 'error'
        ? 'fa-exclamation-circle'
        : 'fa-info-circle';

  return (
    <div className={`cc98-toast-item ${typeClass}`}>
      <i className={`fa ${icon}`}></i>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button className="cc98-toast-close" onClick={() => onRemove(toast.id)} aria-label="关闭">
        &times;
      </button>
    </div>
  );
}
