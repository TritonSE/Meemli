import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Section } from "@/src/api/sections";
import type { Dispatch, SetStateAction } from "react";

import BookOpen from "@/public/icons/program.svg";
import styles from "@/src/components/StudentStaffTable/ProgramSelect.module.css";

export type ProgramSelectProps = {
  items: Section[];
  selected: string[];
  setSelected: Dispatch<SetStateAction<string[]>>;
};

export function ProgramSelect({ items, selected, setSelected }: ProgramSelectProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const isSelected = (section: Section) => selected.includes(section._id);

  const toggleItem = (section: Section) => {
    setSelected((current) => {
      const alreadySelected = current.includes(section._id);
      if (alreadySelected) {
        return current.filter((itemId) => itemId !== section._id);
      }
      return [...current, section._id];
    });
  };

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <div
        className={styles.mainBar}
        role="button"
        tabIndex={0}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((value) => !value);
          }
        }}
      >
        {selected.length === 0 ? (
          <div className={styles.placeholder}>
            <BookOpen size={24} strokeWidth={1.8} />
            <span>Programs</span>
            <ChevronDown
              size={24}
              className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
              strokeWidth={1.8}
            />
          </div>
        ) : (
          <>
            <div className={styles.selectedItems}>
              {items
                .filter((section) => selected.includes(section._id))
                .map((section) => (
                  <span key={section._id} className={styles.selectedBadge}>
                    {section.code}
                  </span>
                ))}
            </div>
            <ChevronDown
              size={24}
              className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
              strokeWidth={1.8}
            />
          </>
        )}
      </div>

      {open && (
        <div className={styles.panel}>
          {items.map((section) => {
            const active = isSelected(section);
            return (
              <div
                key={section._id}
                className={`${styles.panelItem} ${active ? styles.panelItemActive : ""}`}
                onClick={() => toggleItem(section)}
              >
                <div className={styles.itemBox}>
                  <span className={styles.itemCode}>{section.code}</span>
                </div>
                {active && <Check size={16} strokeWidth={2.5} className={styles.checkIcon} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
