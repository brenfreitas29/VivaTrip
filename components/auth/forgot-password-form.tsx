"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { authErrorMessage } from "@/lib/auth/messages";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

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
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      String(form.get("email")),
      { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` },
    );

    if (resetError) {
      setError(authErrorMessage(resetError.message));
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="auth-success" role="status">
        <span>✉</span>
        <h2>Verifique sua caixa de entrada</h2>
        <p>Se houver uma conta com esse e-mail, você receberá um link para criar uma nova senha.</p>
        <Link className="auth-submit" href="/login">Voltar ao login</Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label><span>E-mail</span><input name="email" type="email" autoComplete="email" required /></label>
      {error ? <p className="auth-message error" role="alert">{error}</p> : null}
      <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Enviando…" : "Enviar link de recuperação"}</button>
      <p className="auth-switch"><Link href="/login">Voltar ao login</Link></p>
    </form>
  );
}
