import apiService from "../api";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ApiResponse,
} from "../../types/api";

/**
 * Category API Endpoints
 */
export const categoryApi = {
  /**
   * Get all categories
   */
  async getCategories(params?: Record<string, string>): Promise<ApiResponse<Category[]>> {
    const response = await apiService.get<Category[]>("/product-categories", params);
    return response;
  },

  /**
   * Get category by ID
   */
  async getCategory(id: string): Promise<ApiResponse<Category>> {
    const response = await apiService.get<Category>(
      `/product-categories/${id}`
    );
    return response;
  },

  /**
   * Create new category
   */
  async createCategory(
    data: CreateCategoryRequest
  ): Promise<ApiResponse<Category>> {
    const response = await apiService.post<Category>(
      "/product-categories",
      data
    );
    return response;
  },

  /**
   * Update category
   */
  async updateCategory(
    id: string,
    data: UpdateCategoryRequest
  ): Promise<ApiResponse<Category>> {
    const response = await apiService.put<Category>(
      `/product-categories/${id}`,
      data
    );
    return response;
  },

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>(`/product-categories/${id}`);
    return response;
  },
};

export default categoryApi;
