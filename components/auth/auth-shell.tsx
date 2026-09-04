import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./auth-shell.module.css";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="VivaTrip início">
          <span className={styles.plane} aria-hidden="true">✈</span>
          <span>VivaTrip</span>
        </Link>
      </header>

      <div className={styles.stage}>
        <section className={styles.card}>
          <span className="auth-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p className="auth-description">{description}</p>
          {children}
        </section>
      </div>

      <p className={styles.footnote}>
        Seu caminho mais claro para qualquer lugar.
        <strong><span aria-hidden="true">✈</span> VivaTrip</strong>
      </p>
    </main>
  );
}
