import React from "react";
import { useFormContext } from "react-hook-form";

import styles from "./StepTwoMeetingTimes.module.css";

import type { SectionDraft } from "../SectionForm";

export function StepTwoMeetingTimes() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<SectionDraft>();

  const todayDate = new Date().toISOString().split("T")[0];

  return (
    <div className={`${styles.stepContent} ${styles.dateTimeForm}`}>
      <div className={styles.formElement}>
        <label> Date Duration </label>
        <div>
          <input
            type="date"
            id="start"
            name="section-start"
            defaultValue={todayDate}
            className={styles.startInput}
            required
          />
          to
          <input
            type="date"
            id="end"
            name="section-end"
            defaultValue={todayDate}
            className={styles.startInput}
            required
          />
        </div>
      </div>

      <div className={`${styles.formElement} ${styles.dayTimeGroup}`}>
        <label> Meeting Times </label>
        <div>
          <select name="meeting-days" required>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
          </select>
          <select name="start-time" required>
            <option value="16:00">04:00 PM</option>
          </select>
          <select name="end-time" required>
            <option value="17:00">05:00 PM</option>
          </select>
        </div>
      </div>
    </div>
  );
}
