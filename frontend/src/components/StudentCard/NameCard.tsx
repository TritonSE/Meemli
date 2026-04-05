import { ProfilePicture } from "../ProfilePicture/ProfilePicture";

import styles from "./StudentCard.module.css";

export const NameCard = ({ name, email }: { name: string; email: string }) => {
  return (
    <div className={`${styles.listViewContainer}`}>
      <div className={styles.studentInfoTag}>
        <ProfilePicture size="small" letter={name} />

        <ul className={`${styles.infoItems} ${styles.listView}`}>
          <li className={styles.name}>{name}</li>
          <li className={styles.email}>
            <address>{email}</address>
          </li>
        </ul>
      </div>
    </div>
  );
};
