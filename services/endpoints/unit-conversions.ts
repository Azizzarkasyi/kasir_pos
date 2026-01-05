import apiService from "../api";
import {
  UnitConversion,
  CreateUnitConversionRequest,
  ApiResponse,
} from "../../types/api";

/**
 * Unit Conversions API Endpoints
 */
export const unitConversionsApi = {
  /**
   * Get all unit conversions
   */
  async getUnitConversions(): Promise<ApiResponse<UnitConversion[]>> {
    const response = await apiService.get<UnitConversion[]>("/unit-conversions");
    return response;
  },

  /**
   * Get unit conversion by ID
   */
  async getUnitConversion(id: string): Promise<ApiResponse<UnitConversion>> {
    const response = await apiService.get<UnitConversion>(
      `/unit-conversions/${id}`
    );
    return response;
  },

  /**
   * Create new unit conversion
   */
  async createUnitConversion(
    data: CreateUnitConversionRequest
  ): Promise<ApiResponse<UnitConversion>> {
    const response = await apiService.post<UnitConversion>(
      "/unit-conversions",
      data
    );
    return response;
  },

  /**
   * Update unit conversion
   */
  async updateUnitConversion(
    id: string,
    data: Partial<CreateUnitConversionRequest>
  ): Promise<ApiResponse<UnitConversion>> {
    const response = await apiService.put<UnitConversion>(
      `/unit-conversions/${id}`,
      data
    );
    return response;
  },

  /**
   * Delete unit conversion
   */
  async deleteUnitConversion(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>(`/unit-conversions/${id}`);
    return response;
  },
};

export default unitConversionsApi;
