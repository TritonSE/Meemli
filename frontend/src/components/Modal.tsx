import React, { useEffect } from "react";

import styles from "./Modal.module.css";

import type { ReactNode } from "react";

type ModalProps = {
  child: ReactNode;
  onExit: () => void;
  fitContent?: boolean;
  wrapperStyle?: React.CSSProperties;
};

export const Modal = function Modal({
  child,
  onExit,
  fitContent = false,
  wrapperStyle,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onExit]);

  // Dynamically build the wrapper class string
  const wrapperClass = `${styles.wrapper} ${fitContent ? styles.fitContent : ""}`.trim();

  return (
    <div className={styles.overlay} onClick={onExit}>
      <div className={wrapperClass} style={wrapperStyle} onClick={(e) => e.stopPropagation()}>
        {child}
      </div>
    </div>
  );
};
