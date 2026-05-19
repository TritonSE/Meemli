"use client";
// To do : pop up for the delete + archive, toast in bottom right corner when an action (create, edit delete archive is done,), styling
import {
  AlertTriangle,
  Archive,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Clock,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import styles from "./page.module.css";

import { deleteSection, getAllSections, type Section, updateSection } from "@/src/api/sections";
import { getAllUsers, type User } from "@/src/api/user";
import { Modal } from "@/src/components/Modal";
import { SectionCard } from "@/src/components/SectionCard";
import { CreateSectionFlow } from "@/src/components/SectionForm/SectionForm";
import { Toast } from "@/src/components/Toast";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/hooks/useToast";

// next steps : fetch data, render actual data, filter by active archived, search bar

type Tab = "active" | "archived";

export default function Programs() {
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [sections, setSections] = useState<Section[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [deletingSection, setDeletingSection] = useState<Section | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "alphabetical" | "startDate" | "endDate" | "color" | "createdAt"
  >("alphabetical");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [sortOpen, setSortOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const { toast, showToast, dismissToast } = useToast();
  const { isAdmin } = useAuth();

  const fetchData = async () => {
    const result = await getAllSections();
    if (result.success) {
      setSections(result.data);
    } else {
      throw new Error("Data could not be fetched");
    }
    if (isAdmin) {
      const teacherData = await getAllUsers();
      if (teacherData.success) {
        setUsers(teacherData.data);
      } else {
        throw new Error("User data could not be fetched");
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    if (sortMenuRef) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sortOpen]);

  useEffect(() => {
    void fetchData();
  }, []);

  const visibleSections = sections
    .filter((section) => (activeTab === "active" ? !section.archived : section.archived))
    .filter((section) => section.code.toLowerCase().includes(searchQuery))
    .sort((a, b) => {
      let result = 0;
      switch (sortBy) {
        case "alphabetical":
          result = a.code.localeCompare(b.code);
          break;
        case "startDate":
          result = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case "endDate":
          result = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          break;
        case "color":
          result = a.color.localeCompare(b.color);
          break;
        case "createdAt":
          result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === "asc" ? result : -result;
    });

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.headerSection}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1>Classes</h1>
            <p>Take attendance, add notes, and see trends</p>
          </div>
          {/* Create new class - admin only */}
          {isAdmin && (
            <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
              <Plus size={16} />
              Create New Class
            </button>
          )}
        </div>

        <div className={styles.controls}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabButton} ${activeTab === "active" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("active")}
            >
              <Clock size={15} />
              Active
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "archived" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("archived")}
            >
              <Archive size={15} />
              Archived
            </button>
          </div>
          <div className={styles.rightControls}>
            <div ref={sortMenuRef} className={styles.sortContainer}>
              <button className={styles.sortButton} onClick={() => setSortOpen((open) => !open)}>
                <ArrowUpDown size={15} />
                Sort By
              </button>
              {sortOpen && (
                <div className={styles.sortDropdown}>
                  {[
                    { label: "Alphabetical", value: "alphabetical" },
                    { label: "Date Created", value: "createdAt" },
                    { label: "Start Date", value: "startDate" },
                    { label: "End Date", value: "endDate" },
                    { label: "Color", value: "color" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      className={styles.sortOption}
                      onClick={() => setSortBy(opt.value as typeof sortBy)}
                    >
                      {opt.label}
                      {sortBy === opt.value && <Check size={14} />}
                    </button>
                  ))}

                  <hr className={styles.sortDivider} />

                  {[
                    { label: "Ascending", value: "asc", icon: <ArrowUp size={14} /> },
                    { label: "Descending", value: "desc", icon: <ArrowDown size={14} /> },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      className={styles.sortOption}
                      onClick={() => setSortDir(opt.value as typeof sortDir)}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {opt.icon}
                        {opt.label}
                      </span>
                      {sortDir === opt.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.searchWrapper}>
              <Search size={15} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="Search Class"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Create new section! */}
      <CreateSectionFlow
        active={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          void fetchData();
        }}
        showToast={showToast}
      />

      {/* pop up for deleting section - admin only*/}
      {isAdmin && deletingSection && (
        <Modal
          wrapperStyle={{ maxWidth: "640px", padding: "48px" }}
          child={
            <div className={styles.confirmDialog}>
              <div className={styles.confirmContent}>
                <div className={styles.confirmTitle}>
                  <AlertTriangle size={36} color="#B42318" /> Deleting Class
                </div>
                <p className={styles.confirmBody}>
                  Are you sure you want to delete <strong>{deletingSection.code}</strong>? This
                  action cannot be undone.
                </p>
              </div>
              <div className={styles.confirmFooter}>
                <button className={styles.confirmCancel} onClick={() => setDeletingSection(null)}>
                  Cancel
                </button>
                <button
                  className={styles.confirmDelete}
                  onClick={() => {
                    const deleted = deletingSection;
                    setSections((prev) => prev.filter((s) => s._id !== deleted._id));
                    setDeletingSection(null);
                    void deleteSection(deleted._id);
                    showToast(`${deleted.code} Successfully Deleted!`);
                  }}
                >
                  Yes, I&apos;m sure.
                </button>
              </div>
            </div>
          }
          onExit={() => setDeletingSection(null)}
        />
      )}

      {/* Edit section modal! - admin only*/}
      {isAdmin && (
        <CreateSectionFlow
          active={showCreateModal || !!editingSection}
          sectionId={editingSection?._id}
          onClose={() => {
            setEditingSection(null);
            setShowCreateModal(false);
            void fetchData();
          }}
        />
      )}

      <div className={styles.grid}>
        {visibleSections.map((section) => (
          <SectionCard
            key={section._id}
            code={section.code}
            days={section.days}
            startTime={section.startTime}
            endTime={section.endTime}
            teachers={users
              .filter((teacher) => section.teachers.includes(teacher._id))
              .map((t) => `${t.firstName} ${t.lastName}`)}
            startDate={String(section.startDate)}
            endDate={String(section.endDate)}
            color={section.color}
            archived={section.archived}
            onEdit={() => setEditingSection(section)}
            onArchive={async () => {
              const result = await updateSection({ ...section, archived: !section.archived });
              if (result.success) {
                setSections((prev) =>
                  prev.map((s) => (s._id === result.data._id ? result.data : s)),
                );
                const label = !section.archived ? "Archived" : "Unarchived";
                showToast(`${section.code} Successfully ${label}!`, () => {
                  void updateSection({ ...section, archived: section.archived }).then((undo) => {
                    if (undo.success)
                      setSections((prev) =>
                        prev.map((s) => (s._id === undo.data._id ? undo.data : s)),
                      );
                  });
                });
              }
            }}
            onDelete={() => setDeletingSection(section)}
          />
        ))}
      </div>

      {toast && (
        <Toast
          id="main"
          message={toast.message}
          type={toast.type}
          onUndo={toast.onUndo}
          onDismiss={() => dismissToast()}
        />
      )}
    </div>
  );
}
