export const PRETRIP_KEYS = [
  "documents","apps","connectivity","money","transport","packing","insurance","emergency"
] as const;
export type PretripKey = (typeof PRETRIP_KEYS)[number];
export interface PretripItem {
  id: string;
  trip_id: string;
  user_id: string;
  item_key: PretripKey;
  completed: boolean;
  notes: string | null;
  updated_at: string;
}
