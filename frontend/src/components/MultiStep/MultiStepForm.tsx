"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type FieldValues,
  FormProvider,
  type Path,
  useForm,
  type UseFormProps,
} from "react-hook-form";

import { Button } from "../Button";
import { Modal } from "../Modal";
import { ProgressBar } from "../ProgressBar";

import styles from "./MultiStepForm.module.css";

import type { ZodType } from "zod";

export type StepDef<T extends FieldValues> = {
  id: string;
  title: string;
  description?: string;
  fields: Path<T>[];
  component: React.ReactNode;
};

type MultiStepFormProps<T extends FieldValues> = {
  schema: ZodType<T>;
  defaultValues?: UseFormProps<T>["defaultValues"];
  steps: StepDef<T>[];
  onSubmit: (data: T) => void;
  onCancel: () => void;
  mode: "create" | "edit";
  storageKey: string;
  formTitle: string;
};

export function MultiStepForm<T extends FieldValues>({
  schema,
  defaultValues,
  steps,
  onSubmit,
  onCancel,
  mode,
  storageKey,
  formTitle,
}: MultiStepFormProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // FIX 1: Safe handling of null searchParams
  const currentStep = Number.parseInt(searchParams?.get("step") || "0", 10);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const methods = useForm<T>({
    // FIX 2: Explicit casting for the resolver
    resolver: zodResolver(schema as unknown as ZodType<T>),
    defaultValues,
    mode: "onTouched",
  });

  const { trigger, reset, watch, handleSubmit } = methods;

  // Hydrate from LocalStorage
  useEffect(() => {
    if (mode === "create") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const data = JSON.parse(saved) as T;
          reset(data);
        } catch (e) {
          console.error("Failed to hydrate form draft:", e);
        }
      }
    }
  }, [mode, reset, storageKey]);

  // Save to LocalStorage
  useEffect(() => {
    const subscription = watch((value) => {
      if (mode === "create") {
        localStorage.setItem(storageKey, JSON.stringify(value));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, mode, storageKey]);

  const updateUrlStep = (newStep: number) => {
    // FIX 1 again: Safe handling here
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("step", newStep.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleNext = async () => {
    const fieldsToValidate = steps[currentStep].fields;
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid && currentStep < steps.length - 1) {
      updateUrlStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) updateUrlStep(currentStep - 1);
  };

  const onFinalSubmit = async (data: T) => {
    localStorage.removeItem(storageKey);
    onSubmit(data);
  };

  const confirmCancel = () => {
    localStorage.removeItem(storageKey);
    setShowCancelModal(false);
    onCancel();
  };

  const curStepMeta = steps[currentStep] || steps[0];

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFinalSubmit)} className={styles.formPage}>
        <div className={styles.reused}>
          {mode === "create" && <ProgressBar currentStep={currentStep} totalSteps={steps.length} />}
          <div className={styles.headerSegment}>
            <h1 className={styles.pageTitle}>
              {mode === "create" ? `Add ${formTitle}` : `Edit ${formTitle}`}
            </h1>
            {mode === "create" && curStepMeta.description && (
              <p className={styles.description}>{curStepMeta.description}</p>
            )}
          </div>
          <div className={styles.infoBar}>
            <h2 className={styles.subheading}>{curStepMeta.title}</h2>
          </div>
        </div>

        {mode === "edit" && (
          <div className={styles.editTabs}>
            {steps.map((step, index) => (
              <Button
                key={step.id}
                kind={currentStep === index ? "primary" : "secondary"}
                label={step.title}
                onClick={() => updateUrlStep(index)}
                type="button"
              />
            ))}
          </div>
        )}

        {curStepMeta.component}

        <div className={styles.buttonRow}>
          {currentStep === 0 || mode === "edit" ? (
            <Button
              onClick={() => setShowCancelModal(true)}
              kind="secondary"
              label="Cancel"
              type="button"
            />
          ) : (
            <Button onClick={handlePrev} kind="secondary" label="Back" type="button" />
          )}

          {currentStep === steps.length - 1 || mode === "edit" ? (
            <Button
              kind="primary"
              label={mode === "create" ? "Add" : "Save Changes"}
              type="submit"
            />
          ) : (
            <Button onClick={handleNext} kind="primary" label="Next" type="button" />
          )}
        </div>

        {showCancelModal && (
          <Modal
            onExit={() => setShowCancelModal(false)}
            child={
              <div className={styles.modalContent}>
                <h3>Are you sure you want to cancel?</h3>
                <p>Your progress will be lost.</p>
                <div className={styles.buttonRow}>
                  <Button
                    label="No, keep editing"
                    kind="secondary"
                    onClick={() => setShowCancelModal(false)}
                    type="button"
                  />
                  <Button
                    label="Yes, cancel"
                    kind="primary"
                    onClick={confirmCancel}
                    type="button"
                  />
                </div>
              </div>
            }
          />
        )}
      </form>
    </FormProvider>
  );
}
