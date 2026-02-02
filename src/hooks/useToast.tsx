"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ============================================
// TYPES
// ============================================

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

// ============================================
// CONTEXT
// ============================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newToast: Toast = { id, message, type, duration };
      setToasts((prev) => [...prev, newToast]);

      // Auto remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // Shorthand methods
  const success = useCallback((message: string) => showToast(message, "success"), [showToast]);
  const error = useCallback((message: string) => showToast(message, "error", 5000), [showToast]);
  const warning = useCallback((message: string) => showToast(message, "warning"), [showToast]);
  const info = useCallback((message: string) => showToast(message, "info"), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// ============================================
// TOAST CONTAINER & ITEM COMPONENTS
// ============================================

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const styles: Record<ToastType, { bg: string; icon: string; iconColor: string }> = {
    success: {
      bg: "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800",
      icon: "check_circle",
      iconColor: "text-green-600 dark:text-green-400",
    },
    error: {
      bg: "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800",
      icon: "error",
      iconColor: "text-red-600 dark:text-red-400",
    },
    warning: {
      bg: "bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800",
      icon: "warning",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    info: {
      bg: "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800",
      icon: "info",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
  };

  const style = styles[toast.type];

  return (
    <div
      className={`
        pointer-events-auto
        flex items-start gap-3 p-4 rounded-xl border shadow-lg
        animate-in slide-in-from-right-full fade-in duration-300
        ${style.bg}
      `}
      role="alert"
    >
      <span className={`material-symbols-outlined text-xl ${style.iconColor}`}>
        {style.icon}
      </span>
      <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}

export default useToast;
