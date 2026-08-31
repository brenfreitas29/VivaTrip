export function authErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "E-mail ou senha inválidos.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }

  if (normalized.includes("user already registered")) {
    return "Já existe uma conta com este e-mail.";
  }

  if (normalized.includes("password")) {
    return "A senha não atende aos requisitos de segurança.";
  }

  return "Não foi possível concluir a solicitação. Tente novamente.";
}
