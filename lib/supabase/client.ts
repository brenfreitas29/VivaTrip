import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export async function createClient() {
  if (browserClient) return browserClient;

  const response = await fetch("/auth/config", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Supabase não está configurado.");
  }

  const config = (await response.json()) as { url: string; key: string };
  browserClient = createBrowserClient(config.url, config.key);
  return browserClient;
}
