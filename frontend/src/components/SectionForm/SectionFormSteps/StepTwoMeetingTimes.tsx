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
        <div>
          <label> Date Duration </label>
          <span className={styles.required}>*</span>
        </div>

        {/* Replaced native date inputs with Controller + DateSelect */}
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
          <span style={{ color: "red" }}>Please select valid dates.</span>
        )}
      </div>

      <div className={styles.dateTimeGroup}>
        <Controller
          name="days"
          control={control}
          render={({ field }) => (
            <MultiSelect
              options={WEEKDAYS}
              label="Meeting Time"
              placeholder="Days"
              value={field.value}
              onChange={field.onChange}
              required={true}
              fitContent={true}
            />
          )}
        />
        {errors.days && <span style={{ color: "red" }}>{errors.days.message}</span>}

        <Controller
          name="startTime"
          control={control}
          render={({ field }) => (
            <MultiSelect
              options={TIME_INTERVALS}
              placeholder="Start Time"
              value={field.value ? [field.value] : []}
              onChange={(val) => field.onChange(val[0] || "")}
              required={true}
              fitContent={true}
            />
          )}
        />

        <Controller
          name="endTime"
          control={control}
          render={({ field }) => (
            <MultiSelect
              options={TIME_INTERVALS}
              placeholder="End Time"
              value={field.value ? [field.value] : []}
              onChange={(val) => field.onChange(val[0] || "")}
              required={true}
              fitContent={true}
            />
          )}
        />
      </div>
    </div>
  );
}
