import { useEffect, useRef, useState } from "react";

import styles from "@/src/components/StudentStaffTable/Dropdown.module.css";

export type DropdownItem = {
  content: React.ReactNode;
  onClick?: () => void;
};
export type DropdownProps = {
  items: DropdownItem[];
  placeholder: boolean;
};

export function Dropdown({ items, placeholder }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(placeholder ? null : 0);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Keep selection shape aligned when placeholder mode changes.
  useEffect(() => {
    if (placeholder) {
      setSelectedIndex(null);
      return;
    }

    setSelectedIndex((current) => {
      if (items.length === 0) return null;
      if (current === null || current >= items.length) return 0;
      return current;
    });
  }, [placeholder, items.length]);

  /** Close when clicking outside */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleItemClick = (item: DropdownItem, originalIndex: number) => {
    setSelectedIndex(originalIndex);
    setOpen(false);
    if (item.onClick) {
      item.onClick();
    }
  };

  if (items.length === 0) {
    return null;
  }

  const selectedItem =
    selectedIndex === null ? items[0] : items[Math.min(selectedIndex, items.length - 1)];

  const selectableItems = placeholder
    ? items.slice(1).map((item, idx) => ({ item, originalIndex: idx + 1 }))
    : items.map((item, idx) => ({ item, originalIndex: idx }));

  const dropdownItems = selectableItems.filter(
    ({ originalIndex }) => originalIndex !== selectedIndex,
  );

  return (
    <div className={`${styles.dropdownMenu} ${styles.secondary}`} ref={menuRef}>
      <button onClick={() => setOpen((v) => !v)}>{selectedItem.content}</button>
      {open && (
        <div className={styles.dropdownPanel}>
          {dropdownItems.map(({ item, originalIndex }, index) => (
            <div
              key={index}
              className={styles.dropdownItem}
              onClick={() => handleItemClick(item, originalIndex)}
            >
              {item.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
