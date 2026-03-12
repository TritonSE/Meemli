"use client";

import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import { useState } from "react";

import { AuthCard } from "../../../components/AuthCard";
import { Button } from "../../../components/Button";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { TextField } from "../../../components/TextField";
import { auth } from "../../../util/firebase";

import styles from "./page.module.css";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState({ email: "" });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      setFormErrors({ email: "This field is required" });
      return;
    }

    const isValidEmail = (email_: string) => {
      const atIndex = email_.indexOf("@");
      return atIndex > 0 && email_.includes(".", atIndex);
    };
    if (email && !isValidEmail(email)) {
      setFormErrors({ email: "Invalid email format" });
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setSent(true);
      })
      .catch((error) => {
        setFormErrors({ email: "Failed to send reset instructions. Please try again." });
        console.error("Error sending password reset email:", error);
      });
  }

  return (
    <>
      {!sent ? (
        <AuthCard
          aria-label="Forgot password"
          title="Forgot password?"
          subtitle="Enter your email address below and we’ll send instructions to reset your password."
        >
          <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.field}>
              <TextField
                label="Email"
                name="email"
                placeholder="janedoe@gmail.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {formErrors.email && <ErrorMessage message={formErrors.email} />}
            </div>

            <div className={styles.actions}>
              <Button
                kind="primary"
                label="Send Reset Instructions"
                type="submit"
                className={styles.primaryBtn}
              />
            </div>

            <div className={styles.footerLinkRow}>
              <Link className={styles.link} href="/login">
                Return to Sign in.
              </Link>
            </div>
          </form>
        </AuthCard>
      ) : (
        <AuthCard
          aria-label="Reset instructions sent"
          title="Instructions sent!"
          subtitle="Instructions to reset your password have been sent to you, please check your email."
        >
          <div className={styles.footerLinkRow}>
            <Link className={styles.link} href="/login">
              Return to Sign in.
            </Link>
          </div>
        </AuthCard>
      )}
    </>
  );
}
