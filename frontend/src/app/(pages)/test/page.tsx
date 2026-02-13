"use client";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation"; // 1. New imports

import { ProfilePicture } from "../../(ui)/_components/ProfilePicture/ProfilePicture";

import styles from "./StudentProfile.module.css";

const TAB_CONFIG = [
  { id: "info", label: "Info" },
  { id: "programs", label: "Programs" },
  { id: "attendance", label: "Attendance" },
  { id: "assessments", label: "Assessments" },
  { id: "notes", label: "Notes" },
] as const;

export default function Test() {
  // URL Sync Logic
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // default to first tab if no URL param exists
  const activeTabId = searchParams.get("tab") || TAB_CONFIG[0].id;

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div>
      This Test Page is meant for developers and will be removed in the MVP.
      <br />
      <div className={styles.studentProfileModal}>
        <button className={styles.closeButton}>
          <Image src={"/icons/x.svg"} alt="Close" width={20} height={20} />
        </button>

        <div className={styles.modalContentWrapper}>
          {" "}
          {/* Added wrapper for layout control */}
          <div className={styles.studentInfoTag}>
            <ProfilePicture size="medium" letter="John" />
            <ul className={`${styles.infoItems} ${styles.profileView}`}>
              <li className={styles.name}> John Smith </li>
              <li className={styles.email}>
                <address>john.smith@example.com</address>
              </li>
              <li className={styles.school}>
                <span> 14th Grade</span> University California San Diego | La Jolla, CA{" "}
              </li>
            </ul>
          </div>
          {/* replaced placeholder with tab Logic */}
          <div className={styles.tabsContainer}>
            {/* left side: navigation tiles */}
            <nav className={styles.tabNav} role="tablist" aria-label="Student Sections">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={styles.tabTile}
                  data-active={activeTabId === tab.id}
                  role="tab"
                  aria-selected={activeTabId === tab.id}
                  aria-controls={`panel-${tab.id}`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* right side: display area */}
            <section id={`panel-${activeTabId}`} role="tabpanel" className={styles.tabContent}>
              <div className={styles.contentCard}>
                <h3>{TAB_CONFIG.find((t) => t.id === activeTabId)?.label}</h3>
                <p>This is {activeTabId} content.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
