import apiService from "../api";
import {Merk, ApiResponse} from "../../types/api";

/**
 * Merk/Brand API Endpoints
 */
export const merkApi = {
  /**
   * Get all merks
   */
  async getMerks(params?: Record<string, string>): Promise<ApiResponse<Merk[]>> {
    const response = await apiService.get<Merk[]>("/product-merks", params);
    return response;
  },

  /**
   * Get merk by ID
   */
  async getMerk(id: string): Promise<ApiResponse<Merk>> {
    const response = await apiService.get<Merk>(`/product-merks/${id}`);
    return response;
  },

  /**
   * Create new merk
   */
  async createMerk(data: {name: string}): Promise<ApiResponse<Merk>> {
    const response = await apiService.post<Merk>("/product-merks", data);
    return response;
  },

  /**
   * Update merk
   */
  async updateMerk(
    id: string,
    data: {name: string}
  ): Promise<ApiResponse<Merk>> {
    const response = await apiService.put<Merk>(`/product-merks/${id}`, data);
    return response;
  },

  /**
   * Delete merk
   */
  async deleteMerk(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>(`/product-merks/${id}`);
    return response;
  },
};

export default merkApi;
