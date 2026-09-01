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
const OPENAI_DEFAULT_MODEL = "gpt-5.6-luna";
const GEMINI_DEFAULT_MODEL = "gemini-3.1-flash-lite";

function openAIKey() {
  return process.env.AI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim() || "";
}

function configuredModel() {
  return process.env.AI_MODEL?.trim() || "";
}

function resolvedOpenAIModel() {
  const configured = configuredModel();
  if (!configured || configured === "gpt-5.4" || configured.startsWith("gemini-")) return OPENAI_DEFAULT_MODEL;
  return configured;
}

function resolvedGeminiModel() {
  const configured = configuredModel();
  if (!configured || configured.startsWith("gpt-")) return GEMINI_DEFAULT_MODEL;
  return configured;
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

class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  readonly model: string;

  constructor(private readonly apiKey: string, model?: string) {
    this.model = model || OPENAI_DEFAULT_MODEL;
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
      error?: { message?: string; code?: string; type?: string; param?: string };
      output?: { content?: { type?: string; text?: string }[] }[];
    };

    if (!response.ok) {
      const providerCode = body.error?.code || body.error?.type || "";
      console.error("[VivaTrip AI] OpenAI request failed", {
        status: response.status,
        code: providerCode || "unknown",
        param: body.error?.param || null,
        model: this.model,
      });
      if (response.status === 400 && providerCode === "model_not_found") throw new AIProviderError("O modelo configurado não pertence à OpenAI. O VivaTrip aplicará o modelo padrão no próximo deploy.", "upstream");
      if (response.status === 400) throw new AIProviderError("A configuração da resposta estruturada da IA foi rejeitada. O erro foi registrado para correção.", "upstream");
      if (response.status === 401) throw new AIProviderError("A chave da OpenAI não foi aceita. Verifique a chave configurada na Vercel.", "upstream");
      if (response.status === 403) throw new AIProviderError("A chave da OpenAI não tem permissão para usar o modelo configurado.", "upstream");
      if (response.status === 404) throw new AIProviderError("O modelo de IA configurado não está disponível.", "upstream");
      if (response.status === 429 && providerCode === "insufficient_quota") throw new AIProviderError("A conta da OpenAI está sem créditos de API disponíveis.", "upstream");
      if (response.status === 429) throw new AIProviderError("A VivaTrip AI está recebendo muitas solicitações agora. Aguarde um pouco e tente novamente.", "upstream");
      throw new AIProviderError("A VivaTrip AI não conseguiu gerar o roteiro agora.", "upstream");
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
    this.model = model || GEMINI_DEFAULT_MODEL;
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
  const hasOpenAI = Boolean(openAIKey());
  const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());

  if (explicit === "openai" && hasOpenAI) return "openai";
  if (explicit === "gemini" && hasGemini) return "gemini";
  if (hasOpenAI) return "openai";
  if (hasGemini) return "gemini";
  return explicit || "openai";
}

export function aiConfiguration() {
  const provider = resolvedProviderName();
  const model = provider === "gemini" ? resolvedGeminiModel() : resolvedOpenAIModel();
  const configured = provider === "gemini"
    ? Boolean(process.env.GEMINI_API_KEY?.trim())
    : provider === "openai" && Boolean(openAIKey());

  return { provider, model, configured };
}

export function getAIProvider(): AIProvider {
  const config = aiConfiguration();
  if (config.provider === "gemini") {
    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) throw new AIConfigurationError("A geração com IA ainda não foi configurada.");
    return new GeminiProvider(key, config.model);
  }
  if (config.provider === "openai") {
    const key = openAIKey();
    if (!key) throw new AIConfigurationError("A geração com IA ainda não foi configurada.");
    return new OpenAIProvider(key, config.model);
  }
  throw new AIConfigurationError("O provedor de IA configurado não é suportado.");
}
