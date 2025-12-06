import {ApiResponse} from "../../types/api";
import apiService from "../api";

export interface Branch {
  id: string;
  store_id: string;
  name: string;
  phone: string | null;
  province: {id: string | number; name: string};
  city: {id: string | number; name: string};
  subdistrict: {id: string | number; name: string};
  village: {id: string | number; name: string};
  address: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Branch API Endpoints
 */
export const branchApi = {
  /**
   * Get all branches
   */
  async getBranches(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<Branch[]>> {
    const response = await apiService.get<Branch[]>("/branches", params);
    return response;
  },

  /**
   * Get branch by ID
   */
  async getBranch(id: string): Promise<ApiResponse<Branch>> {
    const response = await apiService.get<Branch>(`/branches/${id}`);
    return response;
  },

  /**
   * Create new branch
   */
  async createBranch(data: {
    name: string;
    phone?: string;
    province: {id: string | number; name: string};
    city: {id: string | number; name: string};
    subdistrict: {id: string | number; name: string};
    village: {id: string | number; name: string};
    address: string;
    status: string;
  }): Promise<ApiResponse<Branch>> {
    const response = await apiService.post<Branch>("/branches", data);
    return response;
  },

  /**
   * Update branch
   */
  async updateBranch(
    id: string,
    data: {
      name?: string;
      phone?: string;
      province?: {id: string | number; name: string};
      city?: {id: string | number; name: string};
      subdistrict?: {id: string | number; name: string};
      village?: {id: string | number; name: string};
      address?: string;
      status?: string;
    }
  ): Promise<ApiResponse<Branch>> {
    const response = await apiService.put<Branch>(`/branches/${id}`, data);
    return response;
  },

  /**
   * Delete branch
   */
  async deleteBranch(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>(`/branches/${id}`);
    return response;
  },
};

export default branchApi;
