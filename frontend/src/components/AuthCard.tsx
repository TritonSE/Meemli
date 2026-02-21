'use client';

import Image from 'next/image';

import styles from './AuthCard.module.css';

type AuthCardProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  'aria-label'?: string;
};

export function AuthCard({ title, subtitle, children, ...rest }: AuthCardProps) {
  return (
    <main className={styles.page}>
        <section className={styles.card} {...rest}>
        <div className={styles.logoRow}>
            <Image
            src="/icons/logo.png"
            alt="Meemli"
            width={32}
            height={32}
            className={styles.logo}
            priority
            />
        </div>

        {title && <h1 className={styles.title}>{title}</h1>}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

        <div className={styles.body}>{children}</div>
        </section>
    </main>
    );
}