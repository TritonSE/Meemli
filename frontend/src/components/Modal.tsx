import styles from "./Modal.module.css"

export const Modal = function Modal({child, onExit}) {
  return (
    <div className={styles.overlay} onClick={onExit}>
      <div className={styles.wrapper} onClick={(e) => e.stopPropagation()}>
        {child}
      </div>
    </div>
  )
}