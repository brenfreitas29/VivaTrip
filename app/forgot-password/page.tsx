import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell eyebrow="Recuperação de acesso" title="Redefina sua senha" description="Informe seu e-mail e enviaremos um link seguro para você voltar à VivaTrip.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
