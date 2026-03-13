"use client";

import { useEffect, useState } from "react";

import styles from "./Toast.module.css";

export type ToastProps = {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number; // ms, default 4000
  onDismiss: (id: string) => void;
  onUndo?: () => void;
};

export function Toast({
  id,
  message,
  type = "success",
  duration = 4000,
  onDismiss,
  onUndo,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => handleDismiss(), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const iconMap = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  const typeClassMap = {
    success: styles.success,
    error: styles.error,
    info: styles.info,
  };

  return (
    <div
      className={`${styles.toast} ${typeClassMap[type]} ${isExiting ? styles.exiting : styles.entering}`}
    >
      {/* Icon */}
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{iconMap[type]}</span>
      </div>

      {/* Message */}
      <div className={styles.message}>{message}</div>

      {/* Undo Button — only shown when onUndo is provided */}
      {onUndo && (
        <button
          className={styles.undoButton}
          onClick={() => {
            onUndo();
            handleDismiss();
          }}
        >
          Undo
        </button>
      )}

      {/* Close Button */}
      <button className={styles.closeButton} onClick={handleDismiss}>
        ×
      </button>
    </div>
  );
}
