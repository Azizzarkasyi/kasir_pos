import {
  CreateFAQPayload,
  FAQResponse,
  FAQSingleResponse,
  ReorderFAQsPayload,
  UpdateFAQPayload
} from "@/types/faq";
import apiClient from "../api";

export const faqService = {
  /**
   * Get all FAQs (including inactive ones)
   */
  getAll: async (): Promise<FAQResponse> => {
    const response = await apiClient.get<FAQResponse>("/faqs");
    return response.data as any;
  },

  /**
   * Get only active FAQs (for customer display)
   */
  getActive: async (): Promise<FAQResponse> => {
    const response = await apiClient.get<FAQResponse>("/faqs/active");
    return response.data!;
  },

  /**
   * Get FAQ by ID
   */
  getById: async (id: string): Promise<FAQSingleResponse> => {
    const response = await apiClient.get<FAQSingleResponse>(`/faqs/${id}`);
    return response.data!;
  },

  /**
   * Create a new FAQ
   */
  create: async (payload: CreateFAQPayload): Promise<FAQSingleResponse> => {
    const response = await apiClient.post<FAQSingleResponse>("/faqs", payload);
    return response.data!;
  },

  /**
   * Update an existing FAQ
   */
  update: async (id: string, payload: UpdateFAQPayload): Promise<FAQSingleResponse> => {
    const response = await apiClient.put<FAQSingleResponse>(`/faqs/${id}`, payload);
    return response.data!;
  },

  /**
   * Delete a FAQ
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/faqs/${id}`);
    return response.data!;
  },

  /**
   * Reorder FAQs
   */
  reorder: async (payload: ReorderFAQsPayload): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>("/faqs/reorder/batch", payload);
    return response.data!;
  },
};
