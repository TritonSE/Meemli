import { InfoIcon, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import CheckCircleIcon from "@/public/icons/check-circle.svg";
import styles from "@/src/components/Toast/Toast.module.css";

export type ToastProps = {
  type: "success" | "error" | "neutral";
  message: string;
  durationMs?: number;
  trigger?: number | string;
  onClose?: () => void;
  action?: {
    label?: string;
    onAction: (...args: unknown[]) => void;
    actionArgs?: unknown[];
  };
};

/**
 * Reusable toast component.
 * @param type - "success", "neutral", or "error". Determines color scheme and icon
 * @param message - string to display tot he user
 * @param durationMs - how long to render the toast (default 5000ms)
 * @param trigger - toast renders whenever this is changed (Date.now() works well)
 * @param onClose - optional callback to run when the toast is finished
 * @param action - optional function that is bound to the toast (most typically an undo button)
 * @returns
 */
export function Toast({ type, message, durationMs = 5000, trigger, onClose, action }: ToastProps) {
  const [isVisible, setIsVisible] = useState<boolean>(Boolean(message));

  useEffect(() => {
    if (!message) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [message, type, durationMs, trigger, onClose]);

  if (!message || !isVisible) return null;

  let icon = <></>;
  let styling;
  switch (type) {
    case "success":
      icon = <CheckCircleIcon />;
      styling = styles.bannerSuccess;
      break;
    case "neutral":
      icon = <InfoIcon />;
      styling = styles.bannerNeutral;
      break;
    case "error":
      icon = <XCircle />;
      styling = styles.bannerError;
      break;
  }

  return (
    <div className={`${styles.banner} ${styling}`}>
      {icon}
      {message}
      {action && (
        <button
          className={styles.bannerUndoButton}
          onClick={() => action.onAction(...(action.actionArgs ?? []))}
          type="button"
        >
          {action.label ?? "Undo"}
        </button>
      )}
    </div>
  );
}
