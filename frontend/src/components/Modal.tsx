import { useEffect } from "react";

import styles from "./Modal.module.css";

import type { ReactNode } from "react";

type ModalProps = {
  child: ReactNode;
  onExit: () => void;
};
export const Modal = function Modal({ child, onExit }: ModalProps) {
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
      <div className={styles.wrapper} onClick={(e) => e.stopPropagation()}>
        {child}
      </div>
    </div>
  );
};
