import { ITINERARY_CATEGORIES, ITINERARY_PERIODS, type GeneratedItinerary } from "@/types/itinerary";

const nullableString = { anyOf: [{ type: "string" }, { type: "null" }] } as const;
const nullableTime = { anyOf: [{ type: "string", pattern: "^([01]\\d|2[0-3]):[0-5]\\d$" }, { type: "null" }] } as const;

export const ITINERARY_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "days"],
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    days: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["dayNumber", "date", "title", "summary", "notes", "items"],
        properties: {
          dayNumber: { type: "integer", minimum: 1 },
          date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
          title: { type: "string" },
          summary: nullableString,
          notes: nullableString,
          items: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["period", "startTime", "endTime", "title", "description", "locationName", "locationAddress", "category", "estimatedDurationMinutes", "estimatedCost", "currency", "notes"],
              properties: {
                period: { type: "string", enum: ITINERARY_PERIODS },
                startTime: nullableTime,
                endTime: nullableTime,
                title: { type: "string" },
                description: nullableString,
                locationName: nullableString,
                locationAddress: { type: "null" },
                category: { type: "string", enum: ITINERARY_CATEGORIES },
                estimatedDurationMinutes: { anyOf: [{ type: "integer", minimum: 15, maximum: 720 }, { type: "null" }] },
                estimatedCost: { type: "null" },
                currency: { type: "null" },
                notes: nullableString,
              },
            },
          },
        },
      },
    },
  },
} as const;

function text(value: unknown, maximum: number): string {
  if (typeof value !== "string") throw new Error("Texto inválido no roteiro gerado.");
  const clean = value.trim();
  if (!clean || clean.length > maximum) throw new Error("Texto inválido no roteiro gerado.");
  return clean;
}

export function validateGeneratedItinerary(value: unknown, expectedDates: string[]): GeneratedItinerary {
  if (!value || typeof value !== "object") throw new Error("A IA retornou um roteiro inválido.");
  const root = value as Record<string, unknown>;
  if (!Array.isArray(root.days) || root.days.length !== expectedDates.length) throw new Error("O roteiro não possui o número correto de dias.");
  const days = root.days.map((rawDay, index) => {
    if (!rawDay || typeof rawDay !== "object") throw new Error("Dia inválido no roteiro.");
    const day = rawDay as Record<string, unknown>;
    if (day.dayNumber !== index + 1 || day.date !== expectedDates[index]) throw new Error("As datas do roteiro não correspondem à viagem.");
    if (!Array.isArray(day.items)) throw new Error("Atividades inválidas no roteiro.");
    const items = day.items.map((rawItem) => {
      if (!rawItem || typeof rawItem !== "object") throw new Error("Atividade inválida.");
      const item = rawItem as Record<string, unknown>;
      if (!ITINERARY_PERIODS.includes(item.period as never) || !ITINERARY_CATEGORIES.includes(item.category as never)) throw new Error("Classificação inválida no roteiro.");
      const duration = item.estimatedDurationMinutes;
      if (duration !== null && (!Number.isInteger(duration) || Number(duration) < 15 || Number(duration) > 720)) throw new Error("Duração inválida no roteiro.");
      if (item.estimatedCost !== null || item.currency !== null || item.locationAddress !== null) throw new Error("O roteiro contém fatos operacionais não verificados.");
      return {
        period: item.period as GeneratedItinerary["days"][number]["items"][number]["period"],
        startTime: item.startTime === null ? null : text(item.startTime, 5),
        endTime: item.endTime === null ? null : text(item.endTime, 5),
        title: text(item.title, 160),
        description: item.description === null ? null : text(item.description, 1200),
        locationName: item.locationName === null ? null : text(item.locationName, 200),
        locationAddress: null,
        category: item.category as GeneratedItinerary["days"][number]["items"][number]["category"],
        estimatedDurationMinutes: duration === null ? null : Number(duration),
        estimatedCost: null,
        currency: null,
        notes: item.notes === null ? null : text(item.notes, 800),
      };
    });
    return { dayNumber: index + 1, date: expectedDates[index], title: text(day.title, 180), summary: day.summary === null ? null : text(day.summary, 1000), notes: day.notes === null ? null : text(day.notes, 800), items };
  });
  return { title: text(root.title, 180), summary: text(root.summary, 1500), days };
}
