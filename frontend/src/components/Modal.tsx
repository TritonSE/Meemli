import { useEffect } from "react";

import styles from "./Modal.module.css";

import type { ReactNode } from "react";

type ModalProps = {
  child: ReactNode;
  onExit: () => void;
  fitContent?: boolean; // Added optional prop
};

export const Modal = function Modal({ child, onExit, fitContent = false }: ModalProps) {
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
      <div className={wrapperClass} onClick={(e) => e.stopPropagation()}>
        {child}
      </div>
    </div>
  );
};
