import styles from "./Modal.module.css";

type ModalProps = {
  child: React.ReactNode;
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
