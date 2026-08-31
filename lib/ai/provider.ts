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

class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  readonly model: string;

  constructor(private readonly apiKey: string, model?: string) {
    this.model = model || "gpt-5.4";
  }

  async generateStructuredItinerary(instructions: string, input: unknown) {
    const response = await fetchWithTimeout("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        store: false,
        instructions,
        input: JSON.stringify(input),
        text: {
          format: {
            type: "json_schema",
            name: "vivatrip_itinerary",
            strict: true,
            schema: ITINERARY_JSON_SCHEMA,
          },
        },
      }),
    });

    const body = await readJson(response) as {
      error?: { message?: string };
      output?: { content?: { type?: string; text?: string }[] }[];
    };

    if (!response.ok) {
      // Do not surface raw provider details to the traveler. They may contain account/configuration information.
      throw new AIProviderError(response.status === 429
        ? "A VivaTrip AI está recebendo muitas solicitações agora. Aguarde um pouco e tente novamente."
        : "A VivaTrip AI não conseguiu gerar o roteiro agora.", "upstream");
    }

    const output = body.output
      ?.flatMap((item) => item.content || [])
      .find((item) => item.type === "output_text")
      ?.text;

    if (!output) throw new AIProviderError("A IA não retornou um roteiro estruturado.", "invalid_response");
    try {
      return JSON.parse(output) as unknown;
    } catch {
      throw new AIProviderError("A IA retornou um roteiro em formato inválido.", "invalid_response");
    }
  }
}

class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  readonly model: string;

  constructor(private readonly apiKey: string, model?: string) {
    this.model = model || "gemini-3.1-flash-lite";
  }

  async generateStructuredItinerary(instructions: string, input: unknown) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`;
    const response = await fetchWithTimeout(endpoint, {
      method: "POST",
      headers: { "x-goog-api-key": this.apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instructions }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify(input) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: ITINERARY_JSON_SCHEMA,
        },
      }),
    });

    const body = await readJson(response) as {
      error?: { message?: string };
      candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
    };

    if (!response.ok) {
      throw new AIProviderError(response.status === 429
        ? "A VivaTrip AI está recebendo muitas solicitações agora. Aguarde um pouco e tente novamente."
        : "A VivaTrip AI não conseguiu gerar o roteiro agora.", "upstream");
    }

    const output = body.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!output) throw new AIProviderError("A IA não retornou um roteiro estruturado.", "invalid_response");
    try {
      return JSON.parse(output) as unknown;
    } catch {
      throw new AIProviderError("A IA retornou um roteiro em formato inválido.", "invalid_response");
    }
  }
}

function resolvedProviderName() {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (explicit) return explicit;
  if (process.env.AI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "openai";
}

export function aiConfiguration() {
  const provider = resolvedProviderName();
  const defaultModel = provider === "gemini" ? "gemini-3.1-flash-lite" : "gpt-5.4";
  const configured = provider === "gemini"
    ? Boolean(process.env.GEMINI_API_KEY)
    : provider === "openai" && Boolean(process.env.AI_API_KEY);

  return { provider, model: process.env.AI_MODEL || defaultModel, configured };
}

export function getAIProvider(): AIProvider {
  const config = aiConfiguration();
  if (config.provider === "gemini") {
    if (!process.env.GEMINI_API_KEY) throw new AIConfigurationError("A geração com IA ainda não foi configurada.");
    return new GeminiProvider(process.env.GEMINI_API_KEY, config.model);
  }
  if (config.provider === "openai") {
    if (!process.env.AI_API_KEY) throw new AIConfigurationError("A geração com IA ainda não foi configurada.");
    return new OpenAIProvider(process.env.AI_API_KEY, config.model);
  }
  throw new AIConfigurationError("O provedor de IA configurado não é suportado.");
}
