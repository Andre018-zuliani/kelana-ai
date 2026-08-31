export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface Trip {
  id: number;
  user_id: number;
  destination: string;
  days: number;
  budget: number;
  category: string;
  daily_budget: number;
  travel_style?: string;
  ai_recommendation?: string | null;
  created_at: string;
  updated_at?: string;
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

export interface ApiErrorResponse {
  detail?: string;
  error?: string;
}
