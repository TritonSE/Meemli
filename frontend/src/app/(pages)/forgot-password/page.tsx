"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthCard } from "../../../components/AuthCard";
import { Button } from "../../../components/Button";
import { TextField } from "../../../components/TextField";

import styles from "./page.module.css";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // TODO: call your API to send reset email
    // await requestPasswordReset(email)

    setSent(true);
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
              />
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
