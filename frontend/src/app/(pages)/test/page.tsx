"use client";
import Image from "next/image";

import { ProfilePicture } from "../../(ui)/_components/ProfilePicture/ProfilePicture";
import { StudentTabs } from "../../(ui)/_components/StudentTabs/StudentTabs";

import styles from "./StudentProfile.module.css";

/* 
All constellation components can be found here:
https://tritonse.github.io/TSE-Constellation/?path=/docs/welcome--documentation
*/
export default function Test() {
  return (
    <div>
      This Test Page is meant for developers and will be removed in the MVP.
      <br />
      <div style={{ display: "flex", gap: "8px" }}>
        Constellation Button examples removed because of button style conflicts...constellation is
        still available to use.
      </div>
      <div className={styles.studentProfileModal}>
        <button className={styles.closeButton}>
          <Image src={"/icons/x.svg"} alt="Close" width={20} height={20} />
        </button>

        <div className={styles.studentProfileContent}>
          <div className={styles.studentInfoTag}>
            {/* I think i should turn this into name card component that takes in a user and has two styles
            The first style is for list view with just name and email and profile picture. The second should be view mode with name, email, grade, school, etc used for this case. */}

            <ProfilePicture size="medium" letter="John" />
            <ul className={`${styles.infoItems} ${styles.profileView}`}>
              <li className={styles.name}> John Smith </li>
              <li className={styles.email}>
                {" "}
                <address>john.smith@example.com</address>
              </li>
              <li className={styles.school}>
                {" "}
                <span> 14th Grade </span> University California San Diego | La Jolla, CA{" "}
              </li>
            </ul>
          </div>

          <div className={styles.studentInfoTag} style={{ display: "none" }}>
            {/* This is the list view style name card */}
            <ProfilePicture size="small" letter="John" />
            <ul className={`${styles.infoItems} ${styles.listView}`}>
              <li className={styles.name}> John Smith </li>
              <li className={styles.email}>
                {" "}
                <address>john.smith@example.com</address>
              </li>
            </ul>
          </div>

          <div>
            <StudentTabs />
          </div>
        </div>
      </div>
    </div>
  );
}
