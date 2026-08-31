import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{ authError?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { authError } = await searchParams;
  const initialError = authError === "configuration"
    ? "A autenticação ainda precisa ser conectada ao projeto Supabase."
    : authError === "callback"
      ? "Este link de autenticação é inválido ou expirou."
      : "";

  return (
    <AuthShell eyebrow="Bem-vindo de volta" title="Entre na VivaTrip" description="Acesse suas viagens e continue planejando o mundo do seu jeito.">
      <LoginForm initialError={initialError} />
    </AuthShell>
  );
}
