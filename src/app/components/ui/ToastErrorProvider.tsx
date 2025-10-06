"use client";

import React, { createContext, useContext, useState } from "react";
import * as Toast from "@radix-ui/react-toast";

type ToastType = "success" | "error" | "info";

interface ToastOptions {
  duration?: number;
  actionLabel?: string;
  action?: (() => void) | null;
}

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  options?: ToastOptions;
}

// Keep a function-style context for backward compatibility but attach helpers
interface ToastContextType {
  (message: string, type?: ToastType, options?: ToastOptions): void;
  success(message: string, options?: ToastOptions): void;
  error(message: string, options?: ToastOptions): void;
  info(message: string, options?: ToastOptions): void;
}

const _noopBase = (
  _message: string,
  _type?: ToastType,
  _options?: ToastOptions
) => {
  void _message;
  void _type;
  void _options;
};
const _noop = Object.assign(_noopBase, {
  success: (_message: string, _options?: ToastOptions) => {
    void _message;
    void _options;
  },
  error: (_message: string, _options?: ToastOptions) => {
    void _message;
    void _options;
  },
  info: (_message: string, _options?: ToastOptions) => {
    void _message;
    void _options;
  },
}) as ToastContextType;

const ToastContext = createContext<ToastContextType>(_noop);

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queue, setQueue] = useState<ToastMessage[]>([]);

  const showToast = (
    message: string,
    type: ToastType = "info",
    options?: ToastOptions
  ) => {
    setQueue((prev) => [...prev, { id: Date.now(), message, type, options }]);
  };

  // attach helpers for convenience
  (showToast as unknown as ToastContextType).success = (
    message: string,
    options?: ToastOptions
  ) => showToast(message, "success", options);
  (showToast as unknown as ToastContextType).error = (
    message: string,
    options?: ToastOptions
  ) => showToast(message, "error", options);
  (showToast as unknown as ToastContextType).info = (
    message: string,
    options?: ToastOptions
  ) => showToast(message, "info", options);

  return (
    <Toast.Provider swipeDirection="right">
      <ToastContext.Provider value={showToast as ToastContextType}>
        {children}

        {queue.map((toast) => (
          <ToastItem
            key={toast.id}
            message={toast.message}
            type={toast.type}
            options={toast.options}
            onClose={() =>
              setQueue((prev) => prev.filter((t) => t.id !== toast.id))
            }
          />
        ))}

        {/* Viewport Radix */}
        <Toast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 w-[280px] max-w-[90vw] outline-none" />
      </ToastContext.Provider>
    </Toast.Provider>
  );
};

interface ToastItemProps {
  message: string;
  type: ToastType;
  options?: ToastOptions;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({
  message,
  type,
  options,
  onClose,
}) => {
  const [open, setOpen] = useState(true);

  const typeStyles: Record<ToastType, string> = {
    success: "bg-primary",
    error: "bg-feedback-error",
    info: "bg-feedback-info",
  };

  const duration = options?.duration ?? 3000;

  return (
    <Toast.Root
      open={open}
      duration={duration}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) onClose();
      }}
      className={`${typeStyles[type]} text-white rounded-md p-2 shadow-lg animate-slide-in-right`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Toast.Title className="font-bold capitalize">{type}</Toast.Title>
          <Toast.Description className="whitespace-pre-wrap">
            {message}
          </Toast.Description>
        </div>

        {options?.actionLabel && (
          <div className="ml-2">
            <Toast.Action
              className="text-white underline"
              altText={options.actionLabel}
              onClick={() => {
                options.action?.();
                setOpen(false);
              }}
            >
              {options.actionLabel}
            </Toast.Action>
          </div>
        )}
      </div>
    </Toast.Root>
  );
};
