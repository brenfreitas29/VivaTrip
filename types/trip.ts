export const TRIP_STYLES = ["relaxed", "moderate", "intensive"] as const;
export const BUDGET_LEVELS = ["budget", "moderate", "comfort", "luxury"] as const;
export const TRIP_STATUSES = ["planning", "upcoming", "ongoing", "completed"] as const;
export const TRIP_INTERESTS = [
  "culture", "history", "food", "nature", "beaches", "nightlife",
  "shopping", "photography", "adventure", "relaxation", "family", "romantic",
] as const;

export type TripStyle = (typeof TRIP_STYLES)[number];
export type BudgetLevel = (typeof BUDGET_LEVELS)[number];
export type TripStatus = (typeof TRIP_STATUSES)[number];
export type TripInterest = (typeof TRIP_INTERESTS)[number];

export interface Trip {
  id: string;
  user_id: string;
  title: string | null;
  destination_country: string;
  destination_city: string;
  start_date: string;
  end_date: string;
  accommodation_name: string | null;
  accommodation_address: string | null;
  travelers_count: number;
  trip_style: TripStyle | null;
  budget_level: BudgetLevel | null;
  interests: TripInterest[];
  notes: string | null;
  status: TripStatus;
  created_at: string;
  updated_at: string;
}

export type TripInput = Pick<
  Trip,
  "title" | "destination_country" | "destination_city" | "start_date" | "end_date" |
  "accommodation_name" | "accommodation_address" | "travelers_count" | "trip_style" |
  "budget_level" | "interests" | "notes" | "status"
>;

