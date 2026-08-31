export const ITINERARY_STATUSES = ["draft", "generating", "ready", "failed"] as const;
export const ITINERARY_PERIODS = ["morning", "afternoon", "evening", "night"] as const;
export const ITINERARY_CATEGORIES = ["attraction", "museum", "food", "nature", "shopping", "experience", "transport", "rest", "nightlife", "other"] as const;

export type ItineraryStatus = (typeof ITINERARY_STATUSES)[number];
export type ItineraryPeriod = (typeof ITINERARY_PERIODS)[number];
export type ItineraryCategory = (typeof ITINERARY_CATEGORIES)[number];

export interface ItineraryItem {
  id: string;
  itinerary_day_id: string;
  position: number;
  period: ItineraryPeriod;
  start_time: string | null;
  end_time: string | null;
  title: string;
  description: string | null;
  location_name: string | null;
  location_address: string | null;
  category: ItineraryCategory;
  estimated_duration_minutes: number | null;
  estimated_cost: number | null;
  currency: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItineraryDay {
  id: string;
  itinerary_id: string;
  day_number: number;
  date: string;
  title: string | null;
  summary: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: ItineraryItem[];
}

export interface Itinerary {
  id: string;
  trip_id: string;
  user_id: string;
  title: string | null;
  summary: string | null;
  generation_status: ItineraryStatus;
  has_user_edits: boolean;
  generation_version: number;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
  days: ItineraryDay[];
}

export interface GeneratedItineraryItem {
  period: ItineraryPeriod;
  startTime: string | null;
  endTime: string | null;
  title: string;
  description: string | null;
  locationName: string | null;
  locationAddress: null;
  category: ItineraryCategory;
  estimatedDurationMinutes: number | null;
  estimatedCost: null;
  currency: null;
  notes: string | null;
}

export interface GeneratedItineraryDay {
  dayNumber: number;
  date: string;
  title: string;
  summary: string | null;
  notes: string | null;
  items: GeneratedItineraryItem[];
}

export interface GeneratedItinerary {
  title: string;
  summary: string;
  days: GeneratedItineraryDay[];
}

