"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { AppSnackbar, NotificationSeverity } from "@/components/ui/AppSnackbar";

export interface NotifyOptions {
  message: string;
  severity?: NotificationSeverity;
  autoHideDuration?: number | null;
}

interface NotificationContextValue {
  notify: (options: NotifyOptions) => void;
  closeNotification: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

interface NotificationState {
  open: boolean;
  message: string;
  severity: NotificationSeverity;
  autoHideDuration: number | null;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "info",
    autoHideDuration: 5000,
  });

  const notify = useCallback(({ message, severity = "info", autoHideDuration = 5000 }: NotifyOptions) => {
    setNotification({
      open: true,
      message,
      severity,
      autoHideDuration,
    });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, closeNotification }}>
      {children}
      <AppSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        autoHideDuration={notification.autoHideDuration}
        onClose={closeNotification}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification deve ser utilizado dentro de um NotificationProvider");
  }
  return context;
}
