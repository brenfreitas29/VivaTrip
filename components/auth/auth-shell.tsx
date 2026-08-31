import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="auth-page">
      <Link className="brand auth-brand" href="/" aria-label="VivaTrip início">
        <span className="brand-mark">VT</span>
        <span>VivaTrip</span>
      </Link>
      <section className="auth-card">
        <span className="auth-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="auth-description">{description}</p>
        {children}
      </section>
      <p className="auth-footnote">Seu caminho mais claro para qualquer lugar.</p>
    </main>
  );
}
