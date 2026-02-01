/**
 * ProgressBar component to display the progress of a multi-step form.
 */
import styles from "./ProgressBar.module.css"
export const ProgressBar = function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  return (
    <div className={styles["progress-track"]}>
      <div className={styles["progress-bar"]} style={{ width: `${progressPercentage}%` }}></div>;
    </div>
  )
};