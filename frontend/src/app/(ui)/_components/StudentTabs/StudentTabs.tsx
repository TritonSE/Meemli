"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import styles from "./StudentTabs.module.css";

type TabItem = {
  id: string;
  label: string;
  icon?: string;
};

const TAB_CONFIG: readonly TabItem[] = [
  { id: "info", label: "Info", icon: "/icons/nav/staff.svg" },
  { id: "programs", label: "Programs", icon: "/icons/nav/programs.svg" },
  { id: "attendance", label: "Attendance", icon: "/icons/nav/attendance.svg" },
  { id: "assessments", label: "Assessments", icon: "/icons/nav/students.svg" },
  { id: "notes", label: "Notes", icon: "/icons/table.svg" },
];

export function StudentTabs() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const activeTabId = searchParams.get("tab") || TAB_CONFIG[0].id;

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={styles.tabsContainer}>
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
            {tab.icon && (
              <Image src={tab.icon} alt="" width={20} height={20} className={styles.tabIcon} />
            )}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <section id={`panel-${activeTabId}`} role="tabpanel" className={styles.tabContent}>
        <div className={styles.contentCard}>
          <h3>{TAB_CONFIG.find((t) => t.id === activeTabId)?.label}</h3>
          <p>This is {activeTabId} content.</p>
        </div>
      </section>
    </div>
  );
}
