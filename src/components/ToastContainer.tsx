import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export default function ToastContainer() {
  const toasts = useGameStore((s) => s.toasts);
  const removeToast = useGameStore((s) => s.removeToast);

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }: { toast: ReturnType<typeof useGameStore>['toasts'][0]; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-state-success/90',
    warning: 'bg-state-warning/90',
    danger: 'bg-state-danger/90',
    info: 'bg-bg-secondary/90',
  }[toast.type];

  const textColor = {
    success: 'text-text-success',
    warning: 'text-state-warning',
    danger: 'text-state-danger',
    info: 'text-text-secondary',
  }[toast.type];

  return (
    <div
      className={`${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-lg text-sm font-medium pointer-events-auto animate-fadeIn max-w-sm`}
      role="status"
    >
      {toast.message}
    </div>
  );
}
