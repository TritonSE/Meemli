/**
 * A reusable Button component with customizable label and style.
 */

import React from "react";

import styles from "./Button.module.css";

export type ButtonProps = {
  label: string;
} & React.ComponentProps<"button">;

export const Button = function Button({
  ref,
  label,
  className,
  ...props
}: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  
  let buttonClass = styles.button;
  if (className) {
    buttonClass += ` ${className}`;
  }
  return (
    <button ref={ref} className={buttonClass} type="button" {...props}>
      {label}
    </button>
  );
};
