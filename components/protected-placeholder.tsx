import Link from "next/link";

type ProtectedPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  name?: string;
  email: string;
};

export function ProtectedPlaceholder({ eyebrow, title, description, name, email }: ProtectedPlaceholderProps) {
  return (
    <main className="protected-page">
      <nav className="protected-nav">
        <Link className="brand" href="/"><span className="brand-mark">VT</span><span>VivaTrip</span></Link>
        <Link href="/">Voltar ao início</Link>
      </nav>
      <section className="protected-card">
        <span className="auth-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="protected-account">
          <span>{(name || email).slice(0, 1).toUpperCase()}</span>
          <div><strong>{name || "Viajante VivaTrip"}</strong><small>{email}</small></div>
        </div>
        <p className="protected-note">Esta área será desenvolvida em uma próxima fase.</p>
      </section>
    </main>
  );
}
