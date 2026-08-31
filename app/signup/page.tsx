import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthShell eyebrow="Sua próxima viagem começa aqui" title="Crie sua conta" description="Salve ideias e prepare suas próximas viagens com a VivaTrip.">
      <SignupForm />
    </AuthShell>
  );
}
