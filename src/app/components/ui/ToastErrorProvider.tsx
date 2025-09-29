"use client";

import React, { createContext, useContext, useState } from "react";
import * as Toast from "@radix-ui/react-toast";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

type ToastContextType = (message: string, type?: ToastType) => void;

const ToastContext = createContext<ToastContextType>(() => {});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queue, setQueue] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    setQueue((prev) => [...prev, { id: Date.now(), message, type }]);
  };

  return (
    <Toast.Provider swipeDirection="right">
      <ToastContext.Provider value={showToast}>
        {children}

        {queue.map((toast) => (
          <ToastItem
            key={toast.id}
            message={toast.message}
            type={toast.type}
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
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ message, type, onClose }) => {
  const [open, setOpen] = useState(true);

  const typeStyles: Record<ToastType, string> = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  return (
    <Toast.Root
      open={open}
      duration={3000}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) onClose();
      }}
      className={`${typeStyles[type]} text-white rounded-md p-2 shadow-lg animate-slide-in-right`}
    >
      <Toast.Title className="font-bold capitalize">{type}</Toast.Title>
      <Toast.Description className="whitespace-pre-wrap">
        {message}
      </Toast.Description>
      <Toast.Action
        className="text-white underline ml-2"
        altText="Fechar"
        onClick={() => setOpen(false)}
      >
        Fechar
      </Toast.Action>
    </Toast.Root>
  );
};
