import { useCallback, useRef, useState } from "react";

type ToastState = {
  message: string;
  onUndo?: () => void;
};

const TIMEOUT_MS = 4000;

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string, onUndo?: () => void) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, onUndo });

    timerRef.current = setTimeout(() => {
      setToast(null);
    }, TIMEOUT_MS);
  }, []);
  const dismissToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);
  return { toast, showToast, dismissToast };
}
