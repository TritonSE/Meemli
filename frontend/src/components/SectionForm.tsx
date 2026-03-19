"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";

import { CustomSelect } from "./CustomSelect";
import { MultiSelect } from "./MultiSelect";
import { ProgressBar } from "./ProgressBar";
import styles from "./SectionForm.module.css";

import type { Section } from "@/src/api/sections";

type SectionFormData = Omit<Section, "_id" | "teachers" | "enrolledStudents" | "createdAt">;
type Tab = "general" | "times" | "people";
const TABS: Tab[] = ["general", "times", "people"];
const STEP_SUBTITLES = [
  "Fill out class name and choose color",
  "Fill out class meeting times and duration",
  "Fill out class teachers and students",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = Array.from({ length: 24 }, (_, h) =>
  ["00", "30"].map((m) => {
    const hour = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "am" : "pm";
    const val = `${String(h).padStart(2, "0")}:${m}`;
    return { label: `${String(hour)}:${m}${ampm}`, value: val };
  }),
).flat();

const COLOR_OPTIONS = ["#9E9E9E", "#E53935", "#FDD835", "#1E88E5", "#C4724A", "#4A6D8C", "#43A047"];

export const SectionForm = function SectionForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: Section;
  onSubmit: (data: SectionFormData) => void | Promise<void>;
  onCancel: () => void;
}) {
  const isEdit = !!initialData;
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SectionFormData>({
    code: initialData?.code ?? "",
    days: initialData?.days ?? [],
    startTime: initialData?.startTime ?? "",
    endTime: initialData?.endTime ?? "",
    startDate: initialData?.startDate ?? "",
    endDate: initialData?.endDate ?? "",
    color: initialData?.color ?? "#9E9E9E",
    archived: initialData?.archived ?? false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit && currentStep < TABS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      void onSubmit(formData);
    }
  };

  // which section to show: tabs for edit, step index for create
  const visibleSection = isEdit ? activeTab : TABS[currentStep];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Progress bar — create mode only */}
      {!isEdit && <ProgressBar currentStep={currentStep} totalSteps={TABS.length} />}

      <div className={styles.titleBlock}>
        <h2 className={styles.title}>{isEdit ? "Edit Program" : "Create Class"}</h2>
        {!isEdit && <p className={styles.subtitle}>{STEP_SUBTITLES[currentStep]}</p>}
      </div>

      {/* Tab buttons — edit mode only */}
      {isEdit && (
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Step content */}
      {visibleSection === "general" && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>
              Class Name <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="ex. ELA Writing Group 1"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Color <span className={styles.required}>*</span>
            </label>
            <div className={styles.colorSwatches}>
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.swatch} ${formData.color === c ? styles.swatchSelected : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setFormData((prev) => ({ ...prev, color: c }))}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {visibleSection === "times" && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>
              Date Duration <span className={styles.required}>*</span>
            </label>
            <div className={styles.dateRow}>
              <div className={styles.dateInputWrapper}>
                <Calendar size={16} className={styles.dateIcon} />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <span>to</span>
              <div className={styles.dateInputWrapper}>
                <Calendar size={16} className={styles.dateIcon} />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Meeting Time <span className={styles.required}>*</span>
            </label>
            <div className={styles.timeRow}>
              <MultiSelect
                options={DAYS.map((d) => ({ label: d, value: d }))}
                values={formData.days}
                onChange={(vals) => setFormData((prev) => ({ ...prev, days: vals }))}
                placeholder="Days"
              />
              <CustomSelect
                options={TIMES}
                value={formData.startTime}
                onChange={(val) => setFormData((prev) => ({ ...prev, startTime: val }))}
                placeholder="Start Time"
              />
              <CustomSelect
                options={TIMES}
                value={formData.endTime}
                onChange={(val) => setFormData((prev) => ({ ...prev, endTime: val }))}
                placeholder="End Time"
              />
            </div>
          </div>
        </>
      )}

      {visibleSection === "people" && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>
              Teachers <span className={styles.required}>*</span>
            </label>
            <div className={styles.tagBox}>
              {initialData?.teachers && initialData.teachers.length > 0 ? (
                initialData.teachers.map((t) => (
                  <span key={t} className={styles.tag}>
                    {t}
                  </span>
                ))
              ) : (
                <span className={styles.placeholderText}>Search or select teacher name</span>
              )}
              <ChevronDown size={16} className={styles.chevron} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Students <span className={styles.required}>*</span>
            </label>
            <div className={styles.tagBox}>
              {initialData?.enrolledStudents && initialData.enrolledStudents.length > 0 ? (
                initialData.enrolledStudents.map((s) => (
                  <span key={s} className={styles.tag}>
                    {s}
                  </span>
                ))
              ) : (
                <span className={styles.placeholderText}>Search or select student name</span>
              )}
              <ChevronDown size={16} className={styles.chevron} />
            </div>
          </div>
        </>
      )}

      <div className={styles.footer}>
        {!isEdit && currentStep > 0 ? (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => setCurrentStep((s) => s - 1)}
          >
            Back
          </button>
        ) : (
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className={styles.submitButton}>
          {isEdit ? "Save" : currentStep < TABS.length - 1 ? "Next" : "Save"}
        </button>
      </div>
    </form>
  );
};
