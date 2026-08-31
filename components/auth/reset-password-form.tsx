"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { authErrorMessage } from "@/lib/auth/messages";
import { createClient } from "@/lib/supabase/client";

type RecoveryState = "checking" | "ready" | "invalid" | "success";

export function ResetPasswordForm() {
  const [status, setStatus] = useState<RecoveryState>("checking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void createClient()
      .then((supabase) => supabase.auth.getUser())
      .then(({ data }) => setStatus(data.user ? "ready" : "invalid"))
      .catch(() => {
        setError("A autenticação ainda precisa ser conectada ao projeto Supabase.");
        setStatus("invalid");
      });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
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
    const supabase = await createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(authErrorMessage(updateError.message));
      setLoading(false);
      return;
    }

    setStatus("success");
    setLoading(false);
  }

  if (status === "checking") {
    return <p className="auth-message" role="status">Validando seu link…</p>;
  }

  if (status === "invalid") {
    return (
      <div className="auth-success auth-invalid" role="alert">
        <span>!</span><h2>Link inválido ou expirado</h2>
        <p>{error || "Solicite um novo link para redefinir sua senha."}</p>
        <Link className="auth-submit" href="/forgot-password">Solicitar novo link</Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="auth-success" role="status">
        <span>✓</span><h2>Senha atualizada</h2>
        <p>Sua nova senha já pode ser usada para entrar na VivaTrip.</p>
        <Link className="auth-submit" href="/login">Entrar</Link>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label><span>Nova senha</span><input name="password" type="password" autoComplete="new-password" minLength={8} required /><small>Mínimo de 8 caracteres</small></label>
      <label><span>Confirmar nova senha</span><input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={8} required /></label>
      {error ? <p className="auth-message error" role="alert">{error}</p> : null}
      <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Salvando…" : "Definir nova senha"}</button>
    </form>
  );
}
