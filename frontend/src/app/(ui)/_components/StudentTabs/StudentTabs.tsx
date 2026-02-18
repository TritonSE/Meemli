"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import styles from "./StudentTabs.module.css";

import type { Student } from "@/src/api/students"; // Adjust path as needed

// 1. Define Props to accept the data
type StudentTabsProps = {
  student: Student;
};

type TabId = "info" | "programs" | "attendance" | "assessments" | "notes";

type TabItem = {
  id: TabId;
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

// --- Sub-Components for specific Views ---

const InfoPanel = ({ student }: { student: Student }) => {
  const { parentContact } = student;

  return (
    <div className={styles.panelContainer}>
      <div className={styles.sectionBlock}>
        <h3>Parent / Guardian Contact</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>Name</label>
            <p>
              {parentContact.firstName} {parentContact.lastName}
            </p>
          </div>
          <div className={styles.infoItem}>
            <label>Email</label>
            <p>{parentContact.email}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Phone</label>
            <p>{parentContact.phoneNumber}</p>
          </div>
        </div>
      </div>
      {/* You can add more blocks here later, e.g. <div className={styles.sectionBlock}><h3>School Info</h3>...</div> */}
    </div>
  );
};

const NotesPanel = ({ comments }: { comments: string }) => {
  return (
    <div className={styles.panelContainer}>
      <h3>Notes & Comments</h3>
      <div className={styles.notesBox}>
        {comments ? (
          <p>{comments}</p>
        ) : (
          <p className={styles.emptyState}>No notes recorded for this student.</p>
        )}
      </div>
    </div>
  );
};

const ComingSoonPanel = ({ title }: { title: string }) => (
  <div className={styles.contentCard}>
    <h3>{title}</h3>
    <p className={styles.emptyState}>This module is coming soon.</p>
  </div>
);

// --- Main Component ---

export function StudentTabs({ student }: StudentTabsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Type assertion ensures we default safely if URL has garbage data
  const activeTabId = (searchParams?.get("tab") as TabId) || TAB_CONFIG[0].id;

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams || "");
    params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // The "Render Map" Logic
  const renderTabContent = () => {
    switch (activeTabId) {
      case "info":
        return <InfoPanel student={student} />;
      case "notes":
        return <NotesPanel comments={student.comments} />;
      case "programs":
      case "attendance":
      case "assessments":
      default:
        // Finds the label for the current ID to display nicely
        const label = TAB_CONFIG.find((t) => t.id === activeTabId)?.label || "Unknown";
        return <ComingSoonPanel title={label} />;
    }
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
        {renderTabContent()}
      </section>
    </div>
  );
}
