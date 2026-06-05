export type Urgency = 'low' | 'medium' | 'high' | 'emergency';

export interface AIAnalysis {
  intent: string;
  symptoms: string[];
  department: string;
  urgency: Urgency;
  suspected_diseases: string[];
}

export interface Message {
  id: string;
  consultation_id: string;
  role: 'user' | 'assistant';
  content: string;
  analysis?: AIAnalysis;
  created_at: string;
}

export interface Consultation {
  id: string;
  session_id: string;
  patient_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatRequest {
  message: string;
  consultation_id?: string;
  history: { role: 'user' | 'assistant'; content: string }[];
}

export interface ChatResponse {
  consultation_id: string;
  message: Message;
}
