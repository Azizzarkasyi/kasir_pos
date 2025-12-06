import {
    ApiResponse,
    CreateUnitRequest,
    Unit,
    UpdateUnitRequest,
} from "../../types/api";
import apiService from "../api";

/**
 * Unit API Endpoints
 */
export const unitApi = {
  /**
   * Get all units
   */
  async getUnits(): Promise<ApiResponse<Unit[]>> {
    const response = await apiService.get<Unit[]>("/product-units");
    return response;
  },

  /**
   * Get unit by ID
   */
  async getUnit(id: string): Promise<ApiResponse<Unit>> {
    const response = await apiService.get<Unit>(`/product-units/${id}`);
    return response;
  },

  /**
   * Create new unit
   */
  async createUnit(data: CreateUnitRequest): Promise<ApiResponse<Unit>> {
    const response = await apiService.post<Unit>("/product-units", data);
    return response;
  },

  /**
   * Update unit
   */
  async updateUnit(
    id: string,
    data: UpdateUnitRequest
  ): Promise<ApiResponse<Unit>> {
    const response = await apiService.put<Unit>(`/product-units/${id}`, data);
    return response;
  },

  /**
   * Delete unit
   */
  async deleteUnit(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>(`/product-units/${id}`);
    return response;
  },
};

export default unitApi;

