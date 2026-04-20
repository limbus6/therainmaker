import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
export default function ToastContainer() {
    const toasts = useGameStore((s) => s.toasts);
    const removeToast = useGameStore((s) => s.removeToast);
    return (_jsx("div", { className: "fixed bottom-4 right-4 flex flex-col gap-2 z-50 pointer-events-none", children: toasts.map((toast) => (_jsx(Toast, { toast: toast, onClose: () => removeToast(toast.id) }, toast.id))) }));
}
function Toast({ toast, onClose }) {
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
    return (_jsx("div", { className: `${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-lg text-sm font-medium pointer-events-auto animate-fadeIn max-w-sm`, role: "status", children: toast.message }));
}
//# sourceMappingURL=ToastContainer.js.map