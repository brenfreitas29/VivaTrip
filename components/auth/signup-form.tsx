"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { authErrorMessage } from "@/lib/auth/messages";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    const confirmation = String(form.get("passwordConfirmation"));

    if (password.length < 8) {
      setError("Use uma senha com pelo menos 8 caracteres.");
      return;
    }

    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    let supabase;
    try {
      supabase = await createClient();
    } catch {
      setError("A autenticação ainda precisa ser conectada ao projeto Supabase.");
      setLoading(false);
      return;
    }
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      },
    });

    if (signUpError) {
      setError(authErrorMessage(signUpError.message));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="auth-success" role="status">
        <span>✓</span>
        <h2>Confira seu e-mail</h2>
        <p>Enviamos um link para confirmar sua conta. Depois, você poderá entrar na VivaTrip.</p>
        <Link className="auth-submit" href="/login">Ir para o login</Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label><span>Nome</span><input name="name" autoComplete="name" required /></label>
      <label><span>E-mail</span><input name="email" type="email" autoComplete="email" required /></label>
      <label><span>Senha</span><input name="password" type="password" autoComplete="new-password" minLength={8} required /><small>Mínimo de 8 caracteres</small></label>
      <label><span>Confirmar senha</span><input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={8} required /></label>
      {error ? <p className="auth-message error" role="alert">{error}</p> : null}
      <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Criando conta…" : "Criar conta"}</button>
      <p className="auth-switch">Já tem conta? <Link href="/login">Entrar</Link></p>
    </form>
  );
}
