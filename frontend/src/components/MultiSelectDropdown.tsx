"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export type MultiSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type MultiSelectDropdownProps = {
  label?: string;
  options: MultiSelectOption[];
  value: string[]; // selected option values
  onChange: (next: string[]) => void;

  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxMenuHeightPx?: number;

  // Optional: if you want a required asterisk on the label
  required?: boolean;
};

export function MultiSelectDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className,
  maxMenuHeightPx = 240,
  required = false,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const selectedOptions = useMemo(() => {
    const map = new Map(options.map((o) => [o.value, o]));
    return value.map((v) => map.get(v)).filter(Boolean) as MultiSelectOption[];
  }, [options, value]);

  function toggleValue(v: string) {
    if (disabled) return;
    const next = selectedSet.has(v)
      ? value.filter((x) => x !== v)
      : [...value, v];
    onChange(next);
  }

  function removeValue(v: string) {
    if (disabled) return;
    onChange(value.filter((x) => x !== v));
  }

  function clearAll() {
    if (disabled) return;
    onChange([]);
  }

  // Close on outside click
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div ref={rootRef} className={`ms-root ${className ?? ""}`}>
      {label && (
        <div className="ms-labelRow">
          <span className="ms-label">
            {label}
            {required && <span className="ms-required"> *</span>}
          </span>

          {!!value.length && (
            <button
              type="button"
              className="ms-clearBtn"
              onClick={clearAll}
              disabled={disabled}
            >
              Clear
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        className={`ms-control ${open ? "is-open" : ""}`}
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="ms-valueArea">
          {selectedOptions.length === 0 ? (
            <span className="ms-placeholder">{placeholder}</span>
          ) : (
            <div className="ms-chips">
              {selectedOptions.map((opt) => (
                <span key={opt.value} className="ms-chip">
                  {opt.label}
                  <button
                    type="button"
                    className="ms-chipX"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeValue(opt.value);
                    }}
                    aria-label={`Remove ${opt.label}`}
                    disabled={disabled}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <span className="ms-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div
          className="ms-menu"
          role="listbox"
          aria-multiselectable="true"
          style={{ maxHeight: maxMenuHeightPx }}
        >
          {options.length === 0 ? (
            <div className="ms-empty">No options</div>
          ) : (
            options.map((opt) => {
              const checked = selectedSet.has(opt.value);
              const optDisabled = disabled || !!opt.disabled;

              return (
                <label
                  key={opt.value}
                  className={`ms-item ${optDisabled ? "is-disabled" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={optDisabled}
                    onChange={() => toggleValue(opt.value)}
                  />
                  <span className="ms-itemText">{opt.label}</span>
                </label>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
