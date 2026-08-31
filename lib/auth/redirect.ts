export function safeRedirectPath(value: string | null | undefined, fallback = "/trips") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}
