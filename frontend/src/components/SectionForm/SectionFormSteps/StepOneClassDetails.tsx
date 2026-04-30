import React from "react";
import { useFormContext } from "react-hook-form";

import { ColorInput } from "../../ColorInput";
import { TextField } from "../../TextField";
import { CLASS_COLORS } from "../SectionForm";

import styles from "./StepOneClassDetails.module.css";

import type { SectionDraft } from "../SectionForm";

export function StepOneClassDetails() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<SectionDraft>();
  const selectedColor = watch("color");

  return (
    <div className={styles.stepContent}>
      <div>
        <TextField
          label="Class Name"
          placeholder="ex. ELA Writing Group 1"
          {...register("code")}
          required={true}
        />

        {errors.code && <span role="alert">{errors.code.message}</span>}
      </div>

      <ColorInput
        colors={CLASS_COLORS}
        value={selectedColor}
        onChange={(color) => setValue("color", color, { shouldValidate: true, shouldDirty: true })}
        error={errors.color?.message}
        required={true}
      />
    </div>
  );
}
