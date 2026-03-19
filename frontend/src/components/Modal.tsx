import React, { useEffect } from "react";

import styles from "./Modal.module.css";

import type { ReactNode } from "react";

type ModalProps = {
  child: ReactNode;
  onExit: () => void;
  wrapperStyle?: React.CSSProperties;
};
export const Modal = function Modal({ child, onExit, wrapperStyle }: ModalProps) {
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

  return (
    <div className={styles.overlay} onClick={onExit}>
      <div className={styles.wrapper} style={wrapperStyle} onClick={(e) => e.stopPropagation()}>
        {child}
      </div>
    </div>
  );
};
