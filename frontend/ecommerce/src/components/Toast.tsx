import { useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} item={toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

interface ToastProps {
  item: ToastItem;
  onClose: () => void;
}

function Toast({ item, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={[
        'flex items-center gap-3 px-5 py-4 rounded shadow-lg min-w-[280px] max-w-md transition-all duration-300',
        item.type === 'success'
          ? 'bg-surface-container-highest text-on-surface border-l-4 border-primary'
          : 'bg-error-container text-on-error-container border-l-4 border-error',
      ].join(' ')}
    >
      {item.type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-primary shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-error shrink-0" />
      )}
      <span className="text-sm font-medium flex-1">{item.message}</span>
      <button
        onClick={onClose}
        className="shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
