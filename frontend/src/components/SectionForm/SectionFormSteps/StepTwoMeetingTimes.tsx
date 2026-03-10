import React from "react";
import { Controller, useFormContext } from "react-hook-form";

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
    register,
    control,
    formState: { errors },
  } = useFormContext<SectionDraft>();

  return (
    <div className={`${styles.stepContent} ${styles.dateTimeForm}`}>
      <div className={styles.formElement}>
        <label> Date Duration </label>
        <div>
          {/* We can use standard register here since they are native HTML inputs */}
          <input type="date" {...register("startDate")} className={styles.startInput} />
          to
          <input type="date" {...register("endDate")} className={styles.startInput} />
        </div>
        {(errors.startDate || errors.endDate) && (
          <span style={{ color: "red" }}>Please select valid dates.</span>
        )}
      </div>

      <div className={styles.dateTimeGroup}>
        {/* Using Controller to bridge react-hook-form with your custom MultiSelect */}
        <Controller
          name="days"
          control={control}
          render={({ field }) => (
            <MultiSelect
              options={WEEKDAYS}
              label="Meeting Time"
              placeholder="Days"
              value={field.value} // The current selected array of IDs
              onChange={field.onChange} // Updates the form state
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
              value={field.value ? [field.value] : []} // Assuming MultiSelect expects an array
              onChange={(val) => field.onChange(val[0] || "")} // Extract single value if needed
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
