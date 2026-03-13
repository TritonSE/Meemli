import React from "react";
import { Controller, useFormContext } from "react-hook-form";

import { DateSelect } from "../../dateSelect";
import { MultiSelect } from "../../MultiSelect/MultiSelect";

import styles from "./StepTwoMeetingTimes.module.css";

import type { SectionDraft } from "../SectionForm";

// Helper adjusted for 24-hour backend IDs
export const generateTimeIntervals = () => {
  const times = [];
  const intervals = ["00", "15", "30", "45"];

  for (let hour = 0; hour < 24; hour++) {
    const ampm = hour < 12 ? "am" : "pm";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    // Format "HH:mm" for the backend ID
    const backendHour = hour.toString().padStart(2, "0");

    for (const minute of intervals) {
      const labelString = `${displayHour}:${minute}${ampm}`;
      const idString = `${backendHour}:${minute}`;
      times.push({ id: idString, label: labelString });
    }
  }
  return times;
};

const TIME_INTERVALS = generateTimeIntervals();
const WEEKDAYS = [
  { id: "Monday", label: "Monday" },
  { id: "Tuesday", label: "Tuesday" },
  { id: "Wednesday", label: "Wednesday" },
  { id: "Thursday", label: "Thursday" },
  { id: "Friday", label: "Friday" },
  { id: "Saturday", label: "Saturday" },
  { id: "Sunday", label: "Sunday" },
];

export function StepTwoMeetingTimes() {
  const {
    control,
    formState: { errors },
  } = useFormContext<SectionDraft>();

  return (
    <div className={`${styles.stepContent} ${styles.dateTimeForm}`}>
      <div className={styles.formElement}>
        <div className={styles.formLabel}>
          <label> Date Duration </label>
          <span className={styles.required}>*</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => <DateSelect value={field.value} onChange={field.onChange} />}
          />
          <span>to</span>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => <DateSelect value={field.value} onChange={field.onChange} />}
          />
        </div>

        {(errors.startDate || errors.endDate) && (
          <span role="alert" style={{ transform: "translateY(5rem)" }}>
            Please select valid dates.
          </span>
        )}
      </div>

      <div>
        <div className={styles.formLabel}>
          <label> Meeting Times </label>
          <span className={styles.required}>*</span>
        </div>
        <div className={styles.dateTimeGroup}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Controller
              name="days"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={WEEKDAYS}
                  placeholder="Days"
                  mode="multiple"
                  value={field.value}
                  onChange={field.onChange}
                  required={true}
                  fitContent={true}
                />
              )}
            />
            {errors.days && <span role="alert">{errors.days.message}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={TIME_INTERVALS}
                  placeholder="Start Time"
                  mode="single"
                  value={field.value ? [field.value] : []}
                  onChange={(val) => field.onChange(val[0] || "")}
                  required={true}
                  fitContent={true}
                />
              )}
            />
            {errors.startTime && <span role="alert">{errors.startTime.message}</span>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={TIME_INTERVALS}
                  placeholder="End Time"
                  mode="single"
                  value={field.value ? [field.value] : []}
                  onChange={(val) => field.onChange(val[0] || "")}
                  required={true}
                  fitContent={true}
                />
              )}
            />
            {errors.endTime && <span role="alert">{errors.endTime.message}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
