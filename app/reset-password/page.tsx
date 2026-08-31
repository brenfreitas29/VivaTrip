import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthShell eyebrow="Novo acesso" title="Crie uma nova senha" description="Escolha uma senha segura para proteger sua conta VivaTrip.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
