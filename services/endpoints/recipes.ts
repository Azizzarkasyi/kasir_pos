import { ApiResponse } from "../../types/api";
import apiService from "../api";

export interface RecipeItem {
  product_id: string;
  variant_id?: string;
  productVariantId?: string | null;
  quantity: number;

  productVariant?: {
    id: string;
    name: string;
    price: number;
    stock: number;
    unit_id: string;
    is_stock_active: boolean;
    min_stock: number;
    capital_price: number;
    product?: {
      id: string;
      name: string;
      price: number;
      is_ingredient?: boolean;
    };
  } | null;
}

export interface Recipe {
  id: string;
  name: string;
  is_active: boolean;
  store_id: string;
  created_at: string;
  updated_at: string;
  items: RecipeItem[];
}

const recipeApi = {
  /**
   * Get all recipes
   */
  async getRecipes(): Promise<ApiResponse<Recipe[]>> {
    const response = await apiService.get<Recipe[]>("/recipes");
    return response;
  },

  /**
   * Get recipe by ID
   */
  async getRecipeById(id: string): Promise<ApiResponse<Recipe>> {
    const response = await apiService.get<Recipe>(`/recipes/${id}`);
    return response;
  },

  /**
   * Create new recipe
   */
  async createRecipe(data: {
    name: string;
    is_active?: boolean;
    items: RecipeItem[];
  }): Promise<ApiResponse<Recipe>> {
    const response = await apiService.post<Recipe>("/recipes", data);
    return response;
  },

  /**
   * Update recipe
   */
  async updateRecipe(
    id: string,
    data: {
      name?: string;
      is_active?: boolean;
      items?: RecipeItem[];
    }
  ): Promise<ApiResponse<Recipe>> {
    const response = await apiService.put<Recipe>(`/recipes/${id}`, data);
    return response;
  },

  /**
   * Delete recipe
   */
  async deleteRecipe(id: string): Promise<ApiResponse<any>> {
    const response = await apiService.delete<any>(`/recipes/${id}`);
    return response;
  },

  /**
   * Update recipe status
   */
  async updateRecipeStatus(
    id: string,
    data: { is_active: boolean }
  ): Promise<ApiResponse<Recipe>> {
    const response = await apiService.put<Recipe>(
      `/recipes/${id}/status`,
      data
    );
    return response;
  },
};

export default recipeApi;
