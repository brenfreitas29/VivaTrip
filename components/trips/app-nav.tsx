"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export function AppNav(){const router=useRouter();async function logout(){const s=await createClient();await s.auth.signOut();router.push("/");router.refresh()}return <nav className="protected-nav trips-nav"><Link className="brand" href="/"><span className="brand-mark">VT</span><span>VivaTrip</span></Link><div><Link href="/dashboard">Início</Link><Link href="/trips">Viagens</Link><Link href="/alerts">Alertas</Link><Link href="/miles">Milhas</Link><Link href="/profile">Perfil</Link><Link href="/account/billing">Plano</Link><button type="button" onClick={logout}>Sair</button></div></nav>}
