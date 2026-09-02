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

export interface KnowledgeDocument {
  id: string;
  filename: string;
  title: string;
  destination: string;
  s3_uri: string;
  bytes: number;
  char_count: number;
  chunk_count: number;
  last_synced: string;
  content: string;
  status: "SYNCED" | "LOCAL_STAGED" | "UPLOADED_TO_S3";
}

export interface KnowledgeChunk {
  chunk_id: string;
  document_id: string;
  document_title: string;
  filename: string;
  section: string;
  text: string;
  score?: number;
}

export interface RagComparisonResult {
  id: string;
  question: string;
  destination: string;
  base_model: {
    model_name: string;
    answer: string;
    latency_ms: number;
    accuracy_rating: "Low" | "Medium" | "High";
    weaknesses: string[];
  };
  rag_model: {
    model_name: string;
    answer: string;
    latency_ms: number;
    accuracy_rating: "Low" | "Medium" | "High";
    cited_sources: Array<{
      filename: string;
      section: string;
    }>;
    retrieved_chunks: KnowledgeChunk[];
    verified_facts: string[];
  };
  improvement_summary: {
    accuracy_boost: string;
    hallucination_fixed: string;
    actionable_insight: string;
  };
}

