"use client";
import { signInWithEmailAndPassword } from "firebase/auth";
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
              }
            })
            .catch((error) => {
              console.error("Error fetching user data:", error);
            });
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
        {/* TODO: fix styling of labels in the textfields */}
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

          {/* TextFieldProps omits "type", so we cast to allow password semantics */}
          <TextField
            {...({ type: "password" } as any)}
            label="Password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <span className={styles.eye} aria-hidden="true">
            {/* simple "eye-off" icon */}
            {/* TODO: add password show/hide icon here */}
          </span>
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
