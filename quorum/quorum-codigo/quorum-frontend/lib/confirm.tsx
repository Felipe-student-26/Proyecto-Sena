"use client";

// Sistema de confirmación promise-based — reemplaza Swal con showCancelButton
// Uso: const ok = await confirm({ title: "¿Eliminar?", description: "..." })

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { AlertTriangle, Info } from "lucide-react";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
}

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setPending({ options, resolve });
    });
  }, []);

  function handleRespuesta(valor: boolean) {
    pending?.resolve(valor);
    setPending(null);
  }

  const isDanger = pending?.options.variant === "danger";
  const confirmText = pending?.options.confirmText ?? (isDanger ? "Sí, continuar" : "Confirmar");
  const cancelText = pending?.options.cancelText ?? "Cancelar";

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {pending && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => handleRespuesta(false)}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="relative w-full max-w-sm rounded-2xl border border-borderSubtle bg-surface p-6 shadow-2xl">
            {/* Icono */}
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${
              isDanger
                ? "bg-error/10 text-error dark:bg-error/15"
                : "bg-verdeClaro text-verde dark:bg-verdeOscuro/25 dark:text-verdeClaro"
            }`}>
              {isDanger
                ? <AlertTriangle size={22} aria-hidden />
                : <Info size={22} aria-hidden />
              }
            </div>

            <h2
              id="confirm-title"
              className="mb-1.5 text-base font-semibold text-foreground"
            >
              {pending.options.title}
            </h2>

            {pending.options.description && (
              <p className="mb-5 text-sm text-muted leading-relaxed">
                {pending.options.description}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => handleRespuesta(false)}
                className="w-full rounded-lg border border-borderSubtle px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surfaceMuted sm:w-auto"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => handleRespuesta(true)}
                className={`w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-all active:scale-[0.98] sm:w-auto ${
                  isDanger
                    ? "bg-error hover:opacity-90"
                    : "bg-verde hover:bg-verdeOscuro"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm debe usarse dentro de ConfirmDialogProvider");
  return ctx.confirm;
}
