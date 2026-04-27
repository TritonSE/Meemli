import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import styles from "./MultiSelect.module.css";

export type Option = {
  id: string;
  label: string;
  colorBg?: string;
  colorText?: string;
  icon?: React.ReactNode;
};

type BaseProps = {
  options: Option[];
  label?: string;
  withChips?: boolean;
  required?: boolean;
  fitContent?: boolean;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  boldenContent?: boolean;
  fullWidth?: boolean;
};

type SingleSelectProps = BaseProps & {
  mode: "single";
  value?: string;
  onChange?: (value: string) => void;
};

type MultiSelectProps = BaseProps & {
  mode?: "multiple";
  value?: string[];
  onChange?: (value: string[]) => void;
};

type Props = SingleSelectProps | MultiSelectProps;

export const MultiSelectNew: React.FC<Props> = (props) => {
  const {
    options,
    label,
    required,
    withChips = false,
    fitContent = false,
    placeholder = "Select...",
    searchable = true,
    disabled = false,
    isLoading = false,
    mode = "multiple",
    leftIcon,
    boldenContent = false,
    fullWidth = false,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [supportsPopover, setSupportsPopover] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const uniqueId = useId().replace(/:/g, "");
  const anchorName = `--select-anchor-${uniqueId}`;

  const internalValue = useMemo(() => {
    if (mode === "single") return props.value ? [props.value] : [];
    return props.value || [];
  }, [mode, props.value]);

  const selectedOptions = useMemo(() => {
    return options.filter((opt) => internalValue.includes(opt.id));
  }, [options, internalValue]);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  // Feature detection for Popover & Anchor API
  useEffect(() => {
    const hasPopover = HTMLElement.prototype.hasOwnProperty("popover");
    const hasAnchor = CSS.supports("anchor-name: --test");
    setSupportsPopover(hasPopover && hasAnchor);
  }, []);

  // Sync React state with the native HTML popover API (if supported)
  useEffect(() => {
    if (!supportsPopover) return;
    
    const popover = popoverRef.current;
    if (!popover) return;

    try {
      if (isOpen) {
        // @ts-ignore
        if (!popover.matches(":popover-open")) popover.showPopover();
      } else {
        // @ts-ignore
        popover.hidePopover();
      }
    } catch (e) {
      console.warn("Native popover failed, falling back to standard rendering.");
      setSupportsPopover(false);
    }
  }, [isOpen, supportsPopover]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!containerRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset search when closing
  useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  const toggleOption = (option: Option) => {
    if (disabled || !props.onChange) return;

    if (props.mode === "single") {
      props.onChange(option.id);
      setIsOpen(false);
      return;
    }

    const isCurrentlySelected = internalValue.includes(option.id);
    if (isCurrentlySelected) {
      props.onChange(internalValue.filter((id) => id !== option.id));
    } else {
      props.onChange([...internalValue, option.id]);
    }
  };

  const handleToggleOpen = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  return (
    <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ""}`} ref={containerRef}>
      {label && (
        <label className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div
        className={`${styles.control} ${fitContent ? styles.fitContent : ""}`}
        role="combobox"
        aria-expanded={isOpen}
        onClick={handleToggleOpen}
        tabIndex={disabled ? -1 : 0}
        // @ts-ignore
        style={supportsPopover ? { anchorName } : {}}
      >
        {leftIcon && (
          <span className={`${styles.leftIcon} ${boldenContent ? styles.boldenIcon : ""}`}>
            {leftIcon}
          </span>
        )}
        <div className={styles.values}>
          {isLoading ? (
            <span className={styles.placeholder}>Loading...</span>
          ) : selectedOptions.length > 0 ? (
            withChips ? (
              selectedOptions.map((s) => (
                <span
                  key={s.id}
                  className={styles.chip}
                  style={{
                    backgroundColor: s.colorBg || undefined,
                    color: s.colorText || undefined,
                  }}
                >
                  {s.label}
                </span>
              ))
            ) : (
              <span className={`${styles.selectedText} ${boldenContent ? styles.boldenText : ""}`} >
                {selectedOptions.map((s) => s.label).join(", ")}
              </span>
            )
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
        </div>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Conditionally render the popover based on support and open state */}
      {(!supportsPopover ? isOpen : true) && (
        <div
          className={`${styles.popover} ${supportsPopover ? "" : styles.popoverFallback}`}
          role="listbox"
          ref={popoverRef}
          // Only apply native popover attributes if fully supported
          {...(supportsPopover ? { popover: "manual" } : {})}
          // @ts-ignore
          style={supportsPopover ? { positionAnchor: anchorName } : {}}
        >
          {isOpen && (
            <>
              {searchable && (
                <input
                  autoFocus
                  className={styles.searchInput}
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <div className={styles.listContainer}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const isSelected = internalValue.includes(option.id);
                    return (
                      <div
                        key={option.id}
                        className={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOption(option);
                        }}
                      >
                        <span
                          className={withChips ? styles.chip : ""}
                          style={withChips ? {
                            backgroundColor: option.colorBg || undefined,
                            color: option.colorText || undefined,
                          } : {}}
                        >
                          {option.icon && <span className={styles.optionIcon}>{option.icon}</span>}
                          {option.label}
                        </span>
                        {isSelected && (
                          <span className={styles.checkIcon}>✓</span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.noResults}>No matches found</div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};