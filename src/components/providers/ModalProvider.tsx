"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { AppModal, ModalType, ButtonColor } from "@/components/ui/AppModal";

export interface ConfirmModalOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: ModalType;
  confirmColor?: ButtonColor;
}

export interface ShowModalOptions {
  title: string;
  message: string;
  type?: ModalType;
  buttonLabel?: string;
}

interface ModalContextValue {
  confirmModal: (options: ConfirmModalOptions) => Promise<boolean>;
  showModal: (options: ShowModalOptions) => Promise<void>;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

interface ModalState {
  open: boolean;
  type: ModalType;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmColor?: ButtonColor;
  isConfirmMode: boolean;
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    type: "confirm",
    title: "",
    message: "",
    confirmLabel: "Confirmar",
    cancelLabel: "Voltar",
    isConfirmMode: true,
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const voidResolverRef = useRef<(() => void) | null>(null);

  const confirmModal = useCallback((options: ConfirmModalOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setModalState({
        open: true,
        type: options.type ?? "confirm",
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel ?? "Confirmar",
        cancelLabel: options.cancelLabel ?? "Voltar",
        confirmColor: options.confirmColor,
        isConfirmMode: true,
      });
    });
  }, []);

  const showModal = useCallback((options: ShowModalOptions): Promise<void> => {
    return new Promise<void>((resolve) => {
      voidResolverRef.current = resolve;
      setModalState({
        open: true,
        type: options.type ?? "info",
        title: options.title,
        message: options.message,
        confirmLabel: options.buttonLabel ?? "Fechar",
        cancelLabel: "Fechar",
        isConfirmMode: false,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setModalState((prev) => ({ ...prev, open: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
    if (voidResolverRef.current) {
      voidResolverRef.current();
      voidResolverRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setModalState((prev) => ({ ...prev, open: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
    if (voidResolverRef.current) {
      voidResolverRef.current();
      voidResolverRef.current = null;
    }
  }, []);

  return (
    <ModalContext.Provider value={{ confirmModal, showModal }}>
      {children}
      <AppModal
        open={modalState.open}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        confirmLabel={modalState.confirmLabel}
        cancelLabel={modalState.cancelLabel}
        confirmColor={modalState.confirmColor}
        onConfirm={modalState.isConfirmMode ? handleConfirm : undefined}
        onCancel={handleCancel}
      />
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal deve ser utilizado dentro de um ModalProvider");
  }
  return context;
}
