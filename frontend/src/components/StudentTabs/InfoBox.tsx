import styles from "@/src/components/StudentTabs/InfoBox.module.css";
export type InfoBoxProps = {
  label: string;
  data: string;
  color: string | undefined;
};

export function InfoBox({ label, data, color }: InfoBoxProps) {
  return (
    <div className={styles.infoBoxWrapper}>
      <p>{label}</p>
      <div className={styles.box} style={{ backgroundColor: color }}>
        <p className={styles.data}>{data}</p>
      </div>
    </div>
  );
}
