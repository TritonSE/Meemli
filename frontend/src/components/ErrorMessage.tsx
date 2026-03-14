import styles from "./ErrorMessage.module.css";

type ErrorMessageProps = {
  message?: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <span className={styles.error}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <g clipPath="url(#clip0_3079_13759)">
          <path
            d="M7.99992 5.33362V8.00028M7.99992 10.667H8.00659M14.6666 8.00028C14.6666 11.6822 11.6818 14.667 7.99992 14.667C4.31802 14.667 1.33325 11.6822 1.33325 8.00028C1.33325 4.31838 4.31802 1.33362 7.99992 1.33362C11.6818 1.33362 14.6666 4.31838 14.6666 8.00028Z"
            stroke="#F04438"
            strokeWidth="1.33333"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_3079_13759">
            <rect width="16" height="16" fill="white" />
          </clipPath>
        </defs>
      </svg>
      <span>{message}</span>
    </span>
  );
}
