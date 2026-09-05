import { ITINERARY_JSON_SCHEMA } from "@/lib/ai/schemas";

export interface AIProvider {
  readonly name: string;
  readonly model: string;
  generateStructuredItinerary(instructions: string, input: unknown): Promise<unknown>;
}

export class AIConfigurationError extends Error {}
export class AIProviderError extends Error {
  constructor(message: string, readonly code: "timeout" | "upstream" | "invalid_response" = "upstream") {
    super(message);
  }
}

const AI_REQUEST_TIMEOUT_MS = 55_000;
const GEMINI_DEFAULT_MODEL = "gemini-3.7-flash";
const MAX_RETRIES = 2;

function geminiKey() {
  return process.env.GEMINI_API_KEY?.trim() || "";
}

function resolvedGeminiModel() {
  const configured = process.env.AI_MODEL?.trim() || "";
  return configured.startsWith("gemini-") ? configured : GEMINI_DEFAULT_MODEL;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AIProviderError("A geração demorou mais que o esperado. Tente novamente em alguns instantes.", "timeout");
    }
    throw new AIProviderError("Não foi possível conectar ao serviço de IA agora.", "upstream");
  } finally {
    clearTimeout(timer);
  }
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return await response.json() as Record<string, unknown>;
  } catch {
    throw new AIProviderError("O serviço de IA retornou uma resposta inválida.", "invalid_response");
  }
}

class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  readonly model: string;

  constructor(private readonly apiKey: string, model?: string) {
    this.model = model || GEMINI_DEFAULT_MODEL;
  }

  async generateStructuredItinerary(instructions: string, input: unknown) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`;
    let response: Response | null = null;
    let body: Record<string, unknown> = {};

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      response = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: {
          "x-goog-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: instructions }] },
          contents: [{ role: "user", parts: [{ text: JSON.stringify(input) }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: ITINERARY_JSON_SCHEMA,
            temperature: 0.7,
          },
        }),
      });

      body = await readJson(response);
      if (response.ok) break;

      const retryable = response.status === 429 || response.status === 503;
      if (!retryable || attempt === MAX_RETRIES) break;
      await wait(900 * 2 ** attempt);
    }

    if (!response || !response.ok) {
      const error = body.error as { message?: string; status?: string } | undefined;
      console.error("[VivaTrip AI] Gemini request failed", {
        status: response?.status ?? 0,
        model: this.model,
        providerStatus: error?.status || null,
      });

      if (response?.status === 400) {
        throw new AIProviderError("O Gemini rejeitou a configuração do roteiro. Tente novamente em alguns instantes.", "upstream");
      }
      if (response?.status === 401 || response?.status === 403) {
        throw new AIProviderError("A chave do Gemini não foi aceita. Verifique GEMINI_API_KEY na Vercel.", "upstream");
      }
      if (response?.status === 404) {
        throw new AIProviderError("O modelo Gemini configurado não está disponível.", "upstream");
      }
      if (response?.status === 429) {
        throw new AIProviderError("O limite gratuito do Gemini foi atingido temporariamente. Aguarde um pouco e tente novamente.", "upstream");
      }
      throw new AIProviderError("A VivaTrip AI não conseguiu gerar o roteiro agora.", "upstream");
    }

    const geminiBody = body as {
      candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
    };
    const output = geminiBody.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!output) {
      throw new AIProviderError("A IA não retornou um roteiro estruturado.", "invalid_response");
    }

    try {
      return JSON.parse(output) as unknown;
    } catch {
      throw new AIProviderError("A IA retornou um roteiro em formato inválido.", "invalid_response");
    }
  }
}

export function aiConfiguration() {
  const model = resolvedGeminiModel();
  return {
    provider: "gemini",
    model,
    configured: Boolean(geminiKey()),
  };
}

export function getAIProvider(): AIProvider {
  const key = geminiKey();
  if (!key) {
    throw new AIConfigurationError("A geração com IA ainda não foi configurada.");
  }
  return new GeminiProvider(key, resolvedGeminiModel());
}
