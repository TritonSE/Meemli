import { Popover } from "@mui/material";
import { useState, useEffect } from "react";

import type { AttendanceSession } from "@/src/api/attendance";
import styles from "./select.module.css";

export function SectionSelect({
  sessions,
  value,
  onChange,
}: {
  sessions: AttendanceSession[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const uniqueSections = Array.from(
    new Map(sessions.map((s) => [s.section?._id, s.section])).values(),
  ).filter(Boolean);
  useEffect(() => {
    if (!value && uniqueSections.length > 0) {
      onChange(uniqueSections[0]?._id || "");
    }
  }, [uniqueSections, value, onChange]);

  const selectedSection = uniqueSections.find((sec) => sec?._id === value);

  const hasSessions = uniqueSections.length > 0;
  const displayText = hasSessions
    ? selectedSection
      ? selectedSection.code
      : "Select Section"
    : ""; // Blank if no sessions

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (hasSessions) setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <div className={`${styles.datePickerWrapper} ${!hasSessions ? styles.blankState : ""}`}>
      <div
        className={styles.visualLabel}
        onClick={handleOpen}
        style={{ cursor: hasSessions ? "pointer" : "default" }}
      >
        {hasSessions && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M9.99996 17.5L9.91654 17.3749C9.33771 16.5067 9.04829 16.0725 8.66588 15.7582C8.32734 15.4799 7.93726 15.2712 7.51797 15.1438C7.04433 15 6.52255 15 5.47898 15H4.33329C3.39987 15 2.93316 15 2.57664 14.8183C2.26303 14.6586 2.00807 14.4036 1.84828 14.09C1.66663 13.7335 1.66663 13.2667 1.66663 12.3333V5.16667C1.66663 4.23324 1.66663 3.76653 1.84828 3.41002C2.00807 3.09641 2.26303 2.84144 2.57664 2.68166C2.93316 2.5 3.39987 2.5 4.33329 2.5H4.66663C6.53347 2.5 7.46688 2.5 8.17993 2.86331C8.80713 3.18289 9.31704 3.69283 9.63663 4.32003C9.99996 5.03307 9.99996 5.96649 9.99996 7.83333M9.99996 17.5V7.83333M9.99996 17.5L10.0834 17.3749C10.6622 16.5067 10.9516 16.0725 11.334 15.7582C11.6725 15.4799 12.0626 15.2712 12.482 15.1438C12.9555 15 13.4774 15 14.521 15H15.6666C16.6 15 17.0668 15 17.4233 14.8183C17.7369 14.6586 17.9919 14.4036 18.1516 14.09C18.3333 13.7335 18.3333 13.2667 18.3333 12.3333V5.16667C18.3333 4.23324 18.3333 3.76653 18.1516 3.41002C17.9919 3.09641 17.7369 2.84144 17.4233 2.68166C17.0668 2.5 16.6 2.5 15.6666 2.5H15.3333C13.4665 2.5 12.533 2.5 11.82 2.86331C11.1928 3.18289 10.6829 3.69283 10.3633 4.32003C9.99996 5.03307 9.99996 5.96649 9.99996 7.83333"
              stroke="#6C6A6B"
              strokeWidth="1.67"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <span className={styles.textElement}>{displayText}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="#9B9D9F"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              width: "320px",
              marginTop: "8px",
              padding: "6px",
              borderRadius: "8px",
              border: "1px solid #e3e2e2",
              background: "#ffffff",
              boxShadow: "0 5px 10px 0 rgba(0, 0, 0, 0.15)",
              backgroundImage: "none",
            },
          },
        }}
      >
        <div className={styles.MenuList}>
          {uniqueSections.map((sec) => (
            <div
              key={sec?._id}
              className={`${styles.MenuItem} ${value === sec?._id ? styles.activeItem : ""}`}
              onClick={() => {
                onChange(sec?._id || "");
                handleClose();
              }}
            >
              <span className={styles.itemText}>{sec?.code}</span>
              {value === sec?._id && (
                <div className={styles.checkPlaceholder}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M16.6667 5L7.50004 14.1667L3.33337 10"
                      stroke="#3F8D7C"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </Popover>
    </div>
  );
}
