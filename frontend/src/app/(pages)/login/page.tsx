"use client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getUser } from "../../../api/user";
import { AuthCard } from "../../../components/AuthCard";
import { Button } from "../../../components/Button";
import { ErrorMessage } from "../../../components/ErrorMessage";
import { TextField } from "../../../components/TextField";
import { auth } from "../../../util/firebase";

import styles from "./page.module.css";

type Errors = {
  email?: string;
  password?: string;
  invalidEmailOrPassword?: string;
  api?: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const errors: Errors = {};

    if (!email.trim()) {
      errors.email = "This field is required";
    }

    if (!password.trim()) {
      errors.password = "This field is required";
    }

    // Email format validation
    const isValidEmail = (e: string) => {
      const atIndex = e.indexOf("@");
      return atIndex > 0 && e.includes(".", atIndex);
    };
    if (email && !isValidEmail(email)) {
      errors.email = "Invalid email format";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const router = useRouter();

  // show a simple full‑screen loading indicator while auth request is in progress
  if (loading) {
    return (
      <div className={styles.loadingScreen} aria-label="Logging in">
        <div className={styles.spinner} />
        <p>Loading…</p>
      </div>
    );
  }

  const handleSignIn = () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;

        if (user) {
          const id = user.uid;
          getUser(id)
            .then((result) => {
              if (result.success) {
                const _userData = result.data;
                // redirect after successful sign-in and user fetch
                router.push("/");
              }
            })
            .catch((error) => {
              console.error("Error fetching user data:", error);
            });
        } else {
          // no user returned
          console.warn("Sign-in succeeded but no user object returned");
        }
      })
      .catch((error) => {
        console.error("Error signing in:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // use auth card component instead of duplicating this code in activate and forgot password pages
  return (
    <AuthCard
      title="Welcome back!"
      subtitle="Sign in to Meemli Program Dashboard"
      aria-label="Sign in"
    >
      <div className={styles.form}>
        <div className={styles.field}>
          <TextField
            label="Email"
            name="email"
            placeholder="janedoe@gmail.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <ErrorMessage message={formErrors.email} />
        </div>

        <div className={`${styles.field} ${styles.passwordField}`}>
          <a className={styles.forgot} href="/forgot-password">
            Forgot Password?
          </a>

          <TextField
            type={showPassword ? "text" : "password"}
            label="Password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className={styles.eye}
            onClick={() => setShowPassword(!showPassword)}
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {showPassword ? (
                // Open eye with iris and pupil
                <>
                  <path
                    d="M2.01759 9.40442C2.57871 8.51617 3.80187 6.81808 5.6036 5.59587C6.81808 4.81858 8.23258 4.16667 10.0003 4.16667C14.2545 4.16667 17.0461 7.9207 17.9839 9.40567C18.0974 9.58542 18.1542 9.67525 18.1859 9.81392C18.2098 9.918 18.2097 10.0823 18.1859 10.1863C18.1541 10.3249 18.097 10.4154 17.9827 10.5963C17.0325 12.0793 14.2412 15.8333 10.0003 15.8333C8.23258 15.8333 6.81808 15.1814 5.6036 14.4041C3.80187 13.1819 2.57871 11.4838 2.01759 10.5956C1.90356 10.4146 1.84656 10.3247 1.81478 10.1862C1.79091 10.082 1.79091 9.91783 1.81476 9.81375C1.84652 9.67517 1.90327 9.58492 2.01677 9.40442C1.90356 9.58492 1.84656 9.67517 1.81478 9.81375L2.01759 9.40442Z"
                    stroke="currentColor"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="10" cy="10" r="2.5" fill="currentColor" />
                </>
              ) : (
                // Eye with slash
                <path
                  d="M8.95241 4.2436C9.29116 4.19352 9.6405 4.16667 10.0003 4.16667C14.2545 4.16667 17.0461 7.9207 17.9839 9.40567C18.0974 9.58542 18.1542 9.67525 18.1859 9.81392C18.2098 9.918 18.2097 10.0823 18.1859 10.1863C18.1541 10.3249 18.097 10.4154 17.9827 10.5963C17.7327 10.9917 17.3518 11.5476 16.8471 12.1504M5.6036 5.59587C3.80187 6.81808 2.57871 8.51617 2.01759 9.40442C1.90356 9.58492 1.84656 9.67517 1.81478 9.81375C1.79091 9.91783 1.79091 10.082 1.81476 10.1862C1.84652 10.3247 1.90327 10.4146 2.01677 10.5943C2.95461 12.0793 5.74617 15.8333 10.0003 15.8333C11.7157 15.8333 13.1932 15.223 14.4073 14.3972M2.50035 2.5L17.5003 17.5M8.23258 8.23223C7.78016 8.68467 7.50035 9.30967 7.50035 10C7.50035 11.3807 8.61966 12.5 10.0003 12.5C10.6907 12.5 11.3157 12.2202 11.7681 11.7677"
                  stroke="currentColor"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </button>

          <ErrorMessage message={formErrors.password} />
        </div>

        <div className={styles.actions}>
          <Button
            kind="primary"
            label="Sign in"
            type="button"
            className={styles.signInBtn}
            onClick={handleSignIn}
            disabled={loading}
          />
        </div>
      </div>
    </AuthCard>
  );
}
