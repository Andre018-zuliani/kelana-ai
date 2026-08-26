export interface Trip {
  id: number;
  destination: string;
  days: number;
  budget: number;
  category: string;
  daily_budget: number;
  ai_recommendation?: string | null;
  created_at?: string;
}

export interface TripFormValues {
  destination: string;
  budget: number;
  days: number;
  travel_style: string;
}

export interface GenerateResponse {
  trip_id: number;
  destination: string;
  recommendation: string;
}
