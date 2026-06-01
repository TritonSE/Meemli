import { useCallback, useRef, useState } from "react";

export type ToastType = "success" | "error" | "info";

type ToastState = {
  message: string;
  type: ToastType;
  onUndo?: () => void;
};

const TIMEOUT_MS = 4000;

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback(
    (message: string, typeOrOnUndo: ToastType | (() => void) = "success", onUndo?: () => void) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      const type = typeof typeOrOnUndo === "function" ? "success" : typeOrOnUndo;
      const undo = typeof typeOrOnUndo === "function" ? typeOrOnUndo : onUndo;

      setToast({ message, type, onUndo: undo });

      timerRef.current = setTimeout(() => {
        setToast(null);
      }, TIMEOUT_MS);
    },
    [],
  );
  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);
  return { toast, showToast, dismissToast };
}
