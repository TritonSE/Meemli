/**
 * A text input field with a label.
 */

import React from "react";
import styles from "src/components/TextField.module.css";

export type TextFieldProps = {
  label: string;
  error?: boolean;
} & Omit<React.ComponentProps<"input">, "type">;

export const TextField = function TextField({
  ref,
  label,
  error = false,
  className,
  ...props
}: TextFieldProps & { ref?: React.RefObject<HTMLInputElement | null> }) {
  let wrapperClass = styles.wrapper;
  if (className) {
    wrapperClass += ` ${className}`;
  }
  let inputClass = styles.input;
  if (error) {
    inputClass += ` ${styles.error}`;
  }
  return (
    <div className={wrapperClass}>
      <label className={styles.label}>
        <p>{label}</p>
        <input ref={ref} type="text" className={inputClass} {...props} />
      </label>
    </div>
  );
};
