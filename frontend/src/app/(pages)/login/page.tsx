'use client';

import Image from 'next/image';

import { AuthCard } from '../../../components/AuthCard';
import { Button } from '../../../components/Button';
import { TextField } from '../../../components/TextField';

import styles from './page.module.css';

export default function LoginPage() {
  // use auth card component instead of duplicating this code in activate and forgot password pages 
  return (
      <AuthCard title="Welcome back!" subtitle="Sign in to Meemli Program Dashboard" aria-label="Sign in">
        <div className={styles.form}>
          {/* TODO: fix styling of labels in the textfields */}
          <div className={styles.field}>
            <TextField
              label="Email"
              name="email"
              placeholder="janedoe@gmail.com"
              autoComplete="email"
            />
          </div>

          <div className={`${styles.field} ${styles.passwordField}`}>
            <a className={styles.forgot} href="/forgot-password">
              Forgot Password?
            </a>

            {/* TextFieldProps omits "type", so we cast to allow password semantics */}
            <TextField
              {...({ type: 'password' } as any)}
              label="Password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
            />

            <span className={styles.eye} aria-hidden="true">
              {/* simple "eye-off" icon */}
              {/* TODO: add password show/hide icon here */}
            </span>
          </div>

          <div className={styles.actions}>
            <Button
              kind="primary"
              label="Sign in"
              type="button"
              className={styles.signInBtn}
            />
          </div>
        </div>
      </AuthCard>
  );
}
