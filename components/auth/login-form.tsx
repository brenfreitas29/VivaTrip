"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authErrorMessage } from "@/lib/auth/messages";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ initialError = "" }: { initialError?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    setLoading(true);
    const form = new FormData(event.currentTarget);
    let supabase;
    try {
      supabase = await createClient();
    } catch {
      setError("A autenticação ainda precisa ser conectada ao projeto Supabase.");
      setLoading(false);
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    if (signInError) {
      setError(authErrorMessage(signInError.message));
      setLoading(false);
      return;
    }

    const next = safeRedirectPath(
      new URLSearchParams(window.location.search).get("next"),
    );
    router.replace(next);
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label>
        <span>E-mail</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        <span>Senha</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <div className="auth-row">
        <Link href="/forgot-password">Esqueci minha senha</Link>
      </div>
      {error ? <p className="auth-message error" role="alert">{error}</p> : null}
      <button className="auth-submit" type="submit" disabled={loading}>
        {loading ? "Entrando…" : "Entrar"}
      </button>
      <p className="auth-switch">Ainda não tem conta? <Link href="/signup">Criar conta</Link></p>
    </form>
  );
}
