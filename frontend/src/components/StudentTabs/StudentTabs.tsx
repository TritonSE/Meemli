// components/StudentTabs.tsx
"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import ProgramCard from "../ProgramCard/ProgramCard";

import styles from "./StudentTabs.module.css";

import type { Section } from "@/src/api/sections";
import type { Student } from "@/src/api/students";

import { getSectionById } from "@/src/api/sections";
import { getUser } from "@/src/api/user";

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

// --- Shared UI Components ---

/**
 * Collapsible accordion wrapper for grouping related term data.
 * Utilizes standard CSS transitions for the chevron state.
 */
const TermGroup = ({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.termWrapper}>
      <div className={styles.termHeading}>
        <button
          className={styles.termButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          {title}
          <svg
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
            width="14"
            height="8"
            viewBox="0 0 14 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M1 1L7 7L13 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {isOpen && <div className={styles.cardsGrid}>{children}</div>}
    </div>
  );
};

// --- Sub-Components for Specific Views ---

const InfoPanel = ({ student }: { student: Student }) => {
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
          </div>
        ) : (
          <p>Not available</p>
        )}
      </div>
    </div>
  );
};

const ProgramsPanel = ({ student }: { student: Student }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSectionsAndTeachers = async () => {
      if (!student.enrolledSections || student.enrolledSections.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const sectionPromises = student.enrolledSections.map(async (id) =>
          getSectionById(id.toString()),
        );
        const sectionResults = await Promise.all(sectionPromises);

        const validSections = sectionResults.flatMap((res) => (res.success ? [res.data] : []));

        const fullyResolvedSections = await Promise.all(
          validSections.map(async (section) => {
            const teacherNamePromises = section.teachers.map(async (uid) => {
              try {
                const userRes = await getUser(uid);

                if (userRes.success) {
                  return `${userRes.data.firstName} ${userRes.data.lastName}`;
                }
                return "Unknown Teacher";
              } catch {
                return "Unknown Teacher";
              }
            });

            const resolvedTeacherNames = await Promise.all(teacherNamePromises);

            return {
              ...section,
              teachers: resolvedTeacherNames,
            };
          }),
        );

        setSections(fullyResolvedSections);
      } catch (error) {
        console.error("Failed to compile program card records:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Explicitly marking the promise as ignored with the void operator
    // satisfies the ts/no-floating-promises lint rule.
    void fetchSectionsAndTeachers();
  }, [student.enrolledSections]);

  if (isLoading) {
    return (
      <div className={styles.panelContainer}>
        <p className={styles.emptyState}>Loading programs...</p>
      </div>
    );
  }

  return (
    <div className={styles.panelContainer}>
      {sections.length > 0 ? (
        <TermGroup title="Current Term">
          {sections.map((section) => (
            <ProgramCard
              key={section._id}
              section={{
                _id: section._id,
                name: section.code,
                teachers: section.teachers,
                startDate: section.startDate,
                endDate: section.endDate,
                color: section.color,
              }}
            />
          ))}
        </TermGroup>
      ) : (
        <p className={styles.emptyState}>No programs registered for this student.</p>
      )}
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

// --- Main Tab Navigation Component ---

export function StudentTabs({ student }: StudentTabsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const activeTabId = (searchParams?.get("tab") as TabId) || TAB_CONFIG[0].id;

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams || "");
    params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const renderTabContent = () => {
    switch (activeTabId) {
      case "info":
        return <InfoPanel student={student} />;
      case "notes":
        return <NotesPanel comments={student.comments} />;
      case "programs":
        return <ProgramsPanel student={student} />;
      case "attendance":
      case "assessments":
      default:
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
