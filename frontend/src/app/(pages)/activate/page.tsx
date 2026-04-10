"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { AuthCard } from "../../../components/AuthCard";
import { Button } from "../../../components/Button";
import { TextField } from "../../../components/TextField";

import styles from "./page.module.css";
import { confirmPasswordReset, sendPasswordResetEmail, verifyPasswordResetCode } from "firebase/auth";

import { auth } from "@/src/util/firebase";

type Step = "loading" | "invited" | "form" | "success" | "expired";

function ActivatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const actionCode = searchParams?.get('oobCode');

  const [step, setStep] = useState<Step>("loading");
  const [error, setError] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");

  const email = useMemo(() => {
    const nestedUrl = searchParams?.get("continueUrl");
    if (!nestedUrl) return "your email";

    try {
      const innerParams = new URL(nestedUrl).searchParams;
      return innerParams.get("email") ?? "your email";
    } catch (err) { 
      console.error("Failed to parse continueUrl:", err);
      return "your email";
    }
  }, [searchParams]);

  const inviter = useMemo(() => {
    const nestedUrl = searchParams?.get("continueUrl");
    if (!nestedUrl) return "Meemli";

    try {
      const innerParams = new URL(nestedUrl).searchParams;
      return innerParams.get("inviter") ?? "Meemli";
    } catch {
      return "Meemli";
    }
  }, [searchParams]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const minLenOk = password.length >= 8;
  const matchOk = confirm.length === 0 ? true : password === confirm;

  useEffect(() => {
    if (!actionCode) {
      setStep("expired");
      setError("No activation code found. Please check your email link.");
      return;
    }

    verifyPasswordResetCode(auth, actionCode)
      .then(() => {
        setStep("invited");
      })
      .catch((rawError: unknown) => { // FIX 2: Type as unknown
        const fbError = rawError as { code?: string }; // Cast to safe interface
        console.error("OOB Validation failed:", rawError);
        setStep("expired");
        if (fbError?.code === "auth/expired-action-code") {
          setError("This activation link has expired.");
        } else {
          setError("This link is invalid or has already been used.");
        }
      });
  }, [actionCode]);

  const handleResend = async () => {
    if (!email || email === "your email") return;
    setResendStatus("sending");
    try {
      await sendPasswordResetEmail(auth, email, { url: window.location.href });
      setResendStatus("sent");
    } catch (err) {
      console.error("Resend failed", err);
      setResendStatus("idle");
    }
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!minLenOk) return;
    if (password !== confirm) return;
    if (!actionCode) return;

    confirmPasswordReset(auth, actionCode, password).then((_resp) => {
      setStep("success");
    }).catch((rawError: unknown) => {
      const fbError = rawError as { code?: string }; // Cast to safe interface
      console.error("Error confirming password reset:", rawError);
      
      setStep("expired");
      if (fbError?.code === "auth/expired-action-code") {
        setError("Your session expired during submission. Please try again.");
      } else {
        setError("Failed to update password. Please try again.");
      }
    });
  }

  if (step === "loading") return null;

  return (
    <>
      {step === "expired" && (
        <AuthCard
          title="Link Expired or Invalid"
          subtitle={error}
        >
          <div className={styles.actions}>
            {email !== "your email" && resendStatus !== "sent" && (
              <Button
                kind="primary"
                label={resendStatus === "sending" ? "Sending..." : "Resend Activation Email"}
                onClick={() => void handleResend()} 
                className={styles.primaryBtn}
                type="button"
              />
            )}
            {resendStatus === "sent" && <p className={styles.helper}>Check your inbox for a new link!</p>}
            <Link className={styles.link} href="/login" style={{ marginTop: '1rem', display: 'block', textAlign: 'center' }}>
              Return to Sign in
            </Link>
          </div>
        </AuthCard>
      )}

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

export default function ActivatePage() {
  return (
    <Suspense fallback={null}>
      <ActivatePageContent />
    </Suspense>
  );
}