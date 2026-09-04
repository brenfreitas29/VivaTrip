"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AppNav() {
  const router = useRouter();

  async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="protected-nav trips-nav" aria-label="Navegação principal">
      <Link className="brand" href="/">
        <span>VivaTrip</span>
        <span className="brand-mark">VT</span>
      </Link>

      <div>
        <Link href="/trips">Viagens</Link>
        <Link href="/explore">Descobrir</Link>
        <Link href="/alerts">Alertas</Link>
        <Link href="/dashboard">Planejador</Link>
        <Link href="/profile">Perfil</Link>
        <button type="button" onClick={logout}>Sair</button>
      </div>
    </nav>
  );
}
