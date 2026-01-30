/**
 * A reusable Button component with customizable label and style.
 */

import React from "react";

import styles from "./Button.module.css";

export type ButtonProps = {
  label: string;
  kind?: "primary" | "secondary";
} & React.ComponentProps<"button">;

export const Button = function Button({
  ref,
  label,
  kind = "primary",
  className,
  ...props
}: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  let buttonClass = styles.button;
  switch (kind) {
    case "primary":
      buttonClass += ` ${styles.primary}`;
      break;
    case "secondary":
      buttonClass += ` ${styles.secondary}`;
      break;
  }
  if (className) {
    buttonClass += ` ${className}`;
  }
  return (
    <button ref={ref} className={buttonClass} type="button" {...props}>
      {label}
    </button>
  );
};
