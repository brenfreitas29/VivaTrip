import Link from "next/link";
import { ProfileForm } from "@/components/profile/profile-form";
import { requireUser } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const name = String(user.user_metadata.full_name || user.email?.split("@")[0] || "Viajante");

  return (
    <main className="profile-page">
      <nav className="protected-nav">
        <Link className="brand" href="/"><span className="brand-mark">VT</span><span>VivaTrip</span></Link>
        <div className="profile-nav-links"><Link href="/trips">Minhas viagens</Link><Link href="/">Voltar ao início</Link></div>
      </nav>
      <header className="profile-header">
        <span className="auth-eyebrow">Seu jeito de viajar</span>
        <h1>Perfil do viajante</h1>
        <p>Preferências que ajudam a VivaTrip a tornar cada viagem mais pessoal.</p>
      </header>
      <ProfileForm email={user.email ?? ""} initialName={name} />
    </main>
  );
}
