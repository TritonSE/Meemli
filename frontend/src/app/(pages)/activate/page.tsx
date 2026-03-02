"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { AuthCard } from "../../../components/AuthCard";
import { Button } from "../../../components/Button";
import { TextField } from "../../../components/TextField";

import styles from "./page.module.css";

type Step = "invited" | "form" | "success";

export default function ActivatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Example: /activate?email=janedoe@gmail.com&inviter=Usha%20Sekar
  const email = useMemo(() => searchParams.get("email") ?? "janedoe@gmail.com", [searchParams]);
  const inviter = useMemo(() => searchParams.get("inviter") ?? "Usha Sekar", [searchParams]);

  const [step, setStep] = useState<Step>("invited");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const minLenOk = password.length >= 8;
  const matchOk = confirm.length === 0 ? true : password === confirm;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Basic client-side checks (keep these even if backend validates too)
    if (!minLenOk) return;
    if (password !== confirm) return;

    // TODO: call your API with token/email/password
    // const token = searchParams.get('token')
    // await activateAccount({ token, email, password })

    setStep("success");
  }

  return (
    <>
      {step === "invited" && (
        <AuthCard
          aria-label="Activation invite"
          title="You’ve been invited!"
          subtitle={`${inviter} at Meemli has invited you to join Meemli Program Dashboard as a teacher. Continue to activate your account.`}
        >
          <div className={styles.actions}>
            <Button
              kind="primary"
              label="Continue"
              type="button"
              className={styles.primaryBtn}
              onClick={() => setStep("form")}
            />
          </div>
        </AuthCard>
      )}

      {step === "form" && (
        <AuthCard
          aria-label="Activate account"
          title="Activate Account"
          subtitle="Create a password to activate your teacher account at Meemli."
        >
          <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.field}>
              <TextField
                label="Email"
                name="email"
                placeholder="janedoe@gmail.com"
                autoComplete="email"
                value={email}
                disabled
              />
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.inlineLabel}>Create Password</label>
              </div>

              {/* TODO: make component for password field and use it here + in login */}
              <div className={styles.inputWithIcon}>
                <TextField
                  type={showPw ? "text" : "password"}
                  label=""
                  name="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {/* simple inline icon (no dependency) */}
                  {showPw ? (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M4 4 20 20"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <p className={styles.helper} data-error={!minLenOk && password.length > 0}>
                Your password must contain 8 characters or more
              </p>
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.inlineLabel}>Confirm Password</label>
              </div>

              <div className={styles.inputWithIcon}>
                <TextField
                  type={showConfirm ? "text" : "password"}
                  label=""
                  name="confirm"
                  placeholder="Password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
                />

                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M4 4 20 20"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {!matchOk && (
                <p className={styles.helper} data-error="true">
                  Passwords do not match
                </p>
              )}
            </div>

            <div className={styles.actions}>
              <Button
                kind="primary"
                label="Activate Account"
                type="submit"
                className={styles.primaryBtn}
                disabled={!minLenOk || password !== confirm || confirm.length === 0}
              />
            </div>

            <div className={styles.footerLinkRow}>
              <Link className={styles.link} href="/login">
                Return to Sign in.
              </Link>
            </div>
          </form>
        </AuthCard>
      )}

      {step === "success" && (
        <AuthCard
          aria-label="Account activated"
          title="Account activated!"
          subtitle="Continue to access your Program Management Dashboard."
        >
          <div className={styles.actions}>
            <Button
              kind="primary"
              label="Continue"
              type="button"
              className={styles.primaryBtn}
              onClick={() => {
                router.push("/");
              }}
            />
          </div>
        </AuthCard>
      )}
    </>
  );
}
