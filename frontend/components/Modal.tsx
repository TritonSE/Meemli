import type { ReactNode } from "react";

type ModalProps = {
  child: ReactNode;
  onExit: () => void;
};
export const Modal = function Modal({ child, onExit }: ModalProps) {
  return (
    <div className={styles.overlay} onClick={onExit}>
      <div className={styles.wrapper} onClick={(e) => e.stopPropagation()}>
        {child}
      </div>
    </div>
  );
};
