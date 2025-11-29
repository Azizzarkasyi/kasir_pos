import apiService from '../api';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ApiResponse,
  PaginatedResponse,
} from '../../types/api';

/**
 * Product API Endpoints
 */
export const productApi = {
  /**
   * Get all products
   */
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<ApiResponse<Product[]>> {
    const response = await apiService.get<Product[]>('/products', params);
    return response;
  },

  /**
   * Get product by ID
   */
  async getProduct(id: number): Promise<ApiResponse<Product>> {
    const response = await apiService.get<Product>(`/products/${id}`);
    return response;
  },

  /**
   * Create new product
   */
  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    const response = await apiService.post<Product>('/products', data);
    return response;
  },

  /**
   * Update product
   */
  async updateProduct(
    id: number,
    data: UpdateProductRequest
  ): Promise<ApiResponse<Product>> {
    const response = await apiService.put<Product>(`/products/${id}`, data);
    return response;
  },

  /**
   * Delete product
   */
  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>(`/products/${id}`);
    return response;
  },

  /**
   * Update product stock
   */
  async updateStock(
    id: number,
    quantity: number,
    type: 'add' | 'subtract'
  ): Promise<ApiResponse<Product>> {
    const response = await apiService.patch<Product>(`/products/${id}/stock`, {
      quantity,
      type,
    });
    return response;
  },

  /**
   * Search products by barcode
   */
  async searchByBarcode(barcode: string): Promise<ApiResponse<Product>> {
    const response = await apiService.get<Product>('/products/barcode', {
      barcode,
    });
    return response;
  },
};

export default productApi;
