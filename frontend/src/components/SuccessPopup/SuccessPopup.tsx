import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import styles from "./SuccessPopup.module.css";

import type { Root } from "react-dom/client";

type SuccessPopupProps = {
  message: string;
  onClose?: () => void;
};

const FADE_TIME = 3000;
const ANIMATION_DURATION = 400;

// 1. The UI Component
function SuccessPopup({ message, onClose }: SuccessPopupProps) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start the fade-out timer immediately on mount
    const timer = setTimeout(() => {
      setIsFading(true);
      // Wait for CSS animation to finish before calling onClose
      const unmountTimer = setTimeout(() => {
        onClose?.();
      }, ANIMATION_DURATION);
      return () => clearTimeout(unmountTimer);
    }, FADE_TIME);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${styles.popup} ${isFading ? styles.fadeOut : ""}`}>
      <span>{message}</span>
    </div>
  );
}

// 2. The Global Singleton Logic
let root: Root | null = null;
let container: HTMLDivElement | null = null;

export function spawnSuccessDialog(message: string) {
  // If one is already active, remove it instantly to avoid stacking
  if (root) {
    root.unmount();
    container?.remove();
  }

  // Create a fresh container at the very end of the <body>
  container = document.createElement("div");
  document.body.appendChild(container);

  root = createRoot(container);

  const handleClose = () => {
    if (root) {
      root.unmount();
      container?.remove();
      root = null;
      container = null;
    }
  };

  root.render(<SuccessPopup message={message} onClose={handleClose} />);
}
