"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
};

// inline styling used because tooltips break with CSS modules and portals
export function Tooltip({ content, children }: TooltipProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const show = () => {
    const el = anchorRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    setPos({
      top: rect.bottom + 8,
      left: rect.right + 8,
    });

    setOpen(true);
  };

  return (
    <>
      <span
        ref={anchorRef}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        style={{ display: "inline-flex" }}
      >
        {children}
      </span>

      {open &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              background: "var(--grey-900)",
              color: "white",
              padding: "6px 10px",
              fontSize: "1rem",
              borderRadius: "4px",
              zIndex: 1000,
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
