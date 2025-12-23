export interface FAQ {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface FAQResponse {
  message: string;
  data: FAQ[];
  total?: number;
}

export interface FAQSingleResponse {
  message: string;
  data: FAQ;
}

export interface CreateFAQPayload {
  question: string;
  answer: string;
  is_active?: boolean;
  order?: number;
}

export interface UpdateFAQPayload {
  question?: string;
  answer?: string;
  is_active?: boolean;
  order?: number;
}

export interface ReorderFAQsPayload {
  ids: string[];
}
