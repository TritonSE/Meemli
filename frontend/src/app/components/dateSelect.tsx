import styles from "./select.module.css";

export function DateSelect({ value, onChange }: { value: string; onChange: (d: string) => void }) {
  const formatDisplayDate = (dateString: string) => {
    let date: Date;

    if (!dateString) {
      // If no value, default to right now
      date = new Date();
    } else {
      const [year, month, day] = dateString.split("-").map(Number);
      date = new Date(year, month - 1, day);
    }

    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    // Get the Month, Day, Year
    const monthName = date.toLocaleDateString("en-US", { month: "long" });
    const dayNum = date.getDate();
    const yearNum = date.getFullYear();

    const formatted = `${monthName} ${dayNum}, ${yearNum}`;
    return isToday ? `(Today) ${formatted}` : formatted;
  };

  return (
    <div className={styles.datePickerWrapper}>
      <div className={styles.dateLabel}>
        {
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M17.5 8.33366H2.5M13.3333 1.66699V5.00033M6.66667 1.66699V5.00033M6.5 18.3337H13.5C14.9002 18.3337 15.6002 18.3337 16.135 18.0612C16.6054 17.8215 16.9878 17.4391 17.2275 16.9687C17.5 16.4338 17.5 15.7338 17.5 14.3337V7.33366C17.5 5.93353 17.5 5.23346 17.2275 4.69868C16.9878 4.22828 16.6054 3.84583 16.135 3.60614C15.6002 3.33366 14.9002 3.33366 13.5 3.33366H6.5C5.09987 3.33366 4.3998 3.33366 3.86503 3.60614C3.39462 3.84583 3.01217 4.22828 2.77248 4.69868C2.5 5.23346 2.5 5.93353 2.5 7.33366V14.3337C2.5 15.7338 2.5 16.4338 2.77248 16.9687C3.01217 17.4391 3.39462 17.8215 3.86503 18.0612C4.3998 18.3337 5.09987 18.3337 6.5 18.3337Z"
              stroke="#6C6A6B"
              strokeWidth="1.67"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        {formatDisplayDate(value)}
        {
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
        }
      </div>

      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.hiddenInput}
      />
    </div>
  );
}
