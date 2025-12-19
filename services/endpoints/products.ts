import {
  ApiResponse,
  CreateProductRequest,
  GetStockHistoryResponse,
  Product,
  UpdateProductRequest
} from "../../types/api";
import apiService from "../api";

/**
 * Product API Endpoints
 */
export const productApi = {
  /**
   * Get all products with filters
   */
  async getProducts(params?: {
    search?: string;
    category_id?: string;
    merk_id?: string;
    branch_id?: string;
    is_favorite?: boolean;
  }): Promise<ApiResponse<Product[]>> {
    const response = await apiService.get<Product[]>("/products?is_product=true", params);
    return response;
  },

  async getProductStock(params?:{
    search?: string;
  }): Promise<ApiResponse<Product[]>> {
    const response = await apiService.get<Product[]>("/products/stocks", params);
    return response;
  },


  async getIngredients(params?: {
    search?: string;
    category_id?: string;
    merk_id?: string;
    branch_id?: string;
    is_favorite?: boolean;
  }): Promise<ApiResponse<Product[]>> {
    const response = await apiService.get<Product[]>("/products?is_ingredient=true", params);
    return response;
  },

  /**
   * Get all stocks
   */
  async getStocks(): Promise<ApiResponse<any[]>> {
    const response = await apiService.get<any[]>("/products/stocks");
    return response;
  },

  /**
   * Get product by ID
   */
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response = await apiService.get<Product>(`/products/${id}`);
    return response;
  },

  /**
   * Get product by variant ID (used for barcode scanning)
   */
  async getProductByVariant(variantId: string): Promise<ApiResponse<Product>> {
    const response = await apiService.get<Product>(
      `/products/variant/${variantId}`
    );
    return response;
  },

  /**
   * Create new product with variants
   */
  async createProduct(
    data: CreateProductRequest
  ): Promise<ApiResponse<Product>> {
    const response = await apiService.post<Product>("/products", data);
    return response;
  },

  /**
   * Update product
   */
  async updateProduct(
    id: string,
    data: UpdateProductRequest
  ): Promise<ApiResponse<Product>> {
    const response = await apiService.put<Product>(`/products/${id}`, data);
    return response;
  },

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>(`/products/${id}`);
    return response;
  },

  /**
   * Update product variant stock
   * @param variantId - Variant ID
   * @param action_type - adjust_stock | add_stock | remove_stock
   * @param amount - Stock amount
   */
  async updateStock(
    variantId: string,
    data: {
      action_type: "adjust_stock" | "add_stock" | "remove_stock";
      amount: number;
      note: string;
    }
  ): Promise<ApiResponse<any>> {
    const response = await apiService.put<any>(
      `/products/${variantId}/stock`,
      data
    );
    return response;
  },

  /**
   * Copy product from another branch
   */
  async addFromBranch(productId: string): Promise<ApiResponse<Product>> {
    const response = await apiService.post<Product>(
      `/products/add-from-branch/${productId}`
    );
    return response;
  },

  /**
   * Get stock history for all products
   */
  async getStockHistory(params?: {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
    product_id?: string;
    variant_id?: string;
    action_type?: "IN" | "OUT" | "ADJUST";
  }): Promise<ApiResponse<GetStockHistoryResponse>> {
    const response = await apiService.get<GetStockHistoryResponse>(
      "/products/stock-history",
      params
    );
    return response;
  },


};

export default productApi;
