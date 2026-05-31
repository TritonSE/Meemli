"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "../Button";
import { Modal } from "../Modal";

import { AttendancePanel } from "./AttendancePanel";
import { EmailTemplate } from "./EmailTemplate";
import styles from "./StudentTabs.module.css";

import type { Section } from "@/src/api/sections";
import type { Student } from "@/src/api/students";
import type { User } from "@/src/api/user";

import { getAllSections } from "@/src/api/sections";
import { getAllUsers } from "@/src/api/user";

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
  { id: "attendance", label: "Attendance", icon: "/icons/nav/attendance.svg" },
  { id: "assessments", label: "Assessments", icon: "/icons/nav/students.svg" },
  { id: "notes", label: "Notes", icon: "/icons/table.svg" },
];

// --- Sub-Components for specific Views ---

const InfoPanel = ({
  student,
  onTemplateClick,
}: {
  student: Student;
  onTemplateClick: () => void;
}) => {
  const { parentContact } = student;

  return (
    <div className={styles.panelContainer}>
      <div className={styles.sectionBlock}>
        <h3>Parent Information</h3>
        {parentContact ? (
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Parent Name</label>
              <p>
                {parentContact.firstName} {parentContact.lastName}
              </p>
            </div>
            <div className={styles.infoItem}>
              <label>Parent Email</label>
              <p>{parentContact.email}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Parent Phone</label>
              <p>{parentContact.phoneNumber}</p>
            </div>
            <div className={styles.infoItem}>
              <Button label="Template Email" kind="primary" onClick={onTemplateClick} />
            </div>
          </div>
        ) : (
          <p>Not available</p>
        )}
      </div>
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
  const [templateOpen, setTemplateOpen] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);

  const activeTabId = (searchParams?.get("tab") as TabId) || TAB_CONFIG[0].id;

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams || "");
    params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    void Promise.all([getAllSections(), getAllUsers()]).then(([sectionsResult, usersResult]) => {
      if (sectionsResult.success) setSections(sectionsResult.data);
      if (usersResult.success) setTeachers(usersResult.data);
    });
  }, []);

  const renderTabContent = () => {
    switch (activeTabId) {
      case "info":
        return <InfoPanel student={student} onTemplateClick={() => setTemplateOpen(true)} />;
      case "notes":
        return <NotesPanel comments={student.comments} />;
      case "attendance":
        return <AttendancePanel student={student} />;
      case "programs":
      case "assessments":
      default:
        const label = TAB_CONFIG.find((t) => t.id === activeTabId)?.label || "Unknown";
        return <ComingSoonPanel title={label} />;
    }
  };

  return (
    <div className={styles.tabsContainer}>
      {templateOpen && (
        <Modal
          child={<EmailTemplate student={student} sections={sections} teachers={teachers} />}
          onExit={() => setTemplateOpen(false)}
        />
      )}
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
      <div className={styles.divider}></div>
      <section id={`panel-${activeTabId}`} role="tabpanel" className={styles.tabContent}>
        {renderTabContent()}
      </section>
    </div>
  );
}
