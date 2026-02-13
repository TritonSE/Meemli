/**
 * A text input field with a label.
 */

import React from "react";

import styles from "./TextField.module.css";

export type TextFieldProps = {
  label: string;
  error?: boolean;
  required?: boolean;
} & Omit<React.ComponentProps<"input">, "type">;

export const TextField = function TextField({
  ref,
  label,
  error = false,
  required = false,
  className,
  ...props
}: TextFieldProps & { ref?: React.RefObject<HTMLInputElement | null> }) {
  let wrapperClass = styles.field;
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
        <div className={styles.inline}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </div>
      </label>
      <input ref={ref} type="text" className={inputClass} {...props} />
    </div>
  );
};
