import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => string;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, dismissToast, dismissAll }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: Toast;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-700",
          border: "border-green-600",
          icon: <CheckCircle size={16} className="text-green-400" />,
        };
      case "error":
        return {
          bg: "bg-red-700",
          border: "border-red-600",
          icon: <AlertCircle size={16} className="text-red-400" />,
        };
      case "warning":
        return {
          bg: "bg-yellow-700",
          border: "border-yellow-600",
          icon: <AlertTriangle size={16} className="text-yellow-400" />,
        };
      case "info":
        return {
          bg: "bg-blue-700",
          border: "border-blue-600",
          icon: <Info size={16} className="text-blue-400" />,
        };
      default:
        return {
          bg: "bg-gray-700",
          border: "border-gray-600",
          icon: <Info size={16} className="text-gray-400" />,
        };
    }
  };

  const styles = getToastStyles(toast.type);

  return (
    <div
      className={`
        ${styles.bg} ${styles.border}
        border rounded-sm p-3 shadow-lg
        animate-in slide-in-from-right-full duration-300
        min-w-[320px] max-w-sm
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>

        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-medium leading-tight">
            {toast.title}
          </div>
          {toast.message && (
            <div className="text-gray-300 text-xs mt-1 leading-tight">
              {toast.message}
            </div>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="text-blue-400 hover:text-blue-300 text-xs mt-2 font-medium underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 text-gray-400 hover:text-white p-0.5"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Convenience functions
// eslint-disable-next-line react-refresh/only-export-components
export const useToastHelpers = () => {
  const { showToast } = useToast();

  return {
    success: (title: string, message?: string, options?: Partial<Toast>) =>
      showToast({ type: "success", title, message, ...options }),
    error: (title: string, message?: string, options?: Partial<Toast>) =>
      showToast({ type: "error", title, message, ...options }),
    warning: (title: string, message?: string, options?: Partial<Toast>) =>
      showToast({ type: "warning", title, message, ...options }),
    info: (title: string, message?: string, options?: Partial<Toast>) =>
      showToast({ type: "info", title, message, ...options }),
  };
};
