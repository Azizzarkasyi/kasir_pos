import apiService from '../api';
import {
  Transaction,
  CreateTransactionRequest,
  ApiResponse,
} from '../../types/api';

/**
 * Transaction API Endpoints
 */
export const transactionApi = {
  /**
   * Get all transactions
   */
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    paymentStatus?: string;
  }): Promise<ApiResponse<Transaction[]>> {
    const response = await apiService.get<Transaction[]>('/transactions', params);
    return response;
  },

  /**
   * Get transaction by ID
   */
  async getTransaction(id: number): Promise<ApiResponse<Transaction>> {
    const response = await apiService.get<Transaction>(`/transactions/${id}`);
    return response;
  },

  /**
   * Create new transaction
   */
  async createTransaction(
    data: CreateTransactionRequest
  ): Promise<ApiResponse<Transaction>> {
    const response = await apiService.post<Transaction>('/transactions', data);
    return response;
  },

  /**
   * Cancel transaction
   */
  async cancelTransaction(id: number): Promise<ApiResponse<Transaction>> {
    const response = await apiService.patch<Transaction>(
      `/transactions/${id}/cancel`
    );
    return response;
  },

  /**
   * Get transaction statistics
   */
  async getStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<
    ApiResponse<{
      totalRevenue: number;
      totalTransactions: number;
      averageTransaction: number;
    }>
  > {
    const response = await apiService.get<{
      totalRevenue: number;
      totalTransactions: number;
      averageTransaction: number;
    }>('/transactions/stats', params);
    return response;
  },

  /**
   * Get daily sales report
   */
  async getDailySales(date?: string): Promise<
    ApiResponse<{
      date: string;
      totalRevenue: number;
      totalTransactions: number;
      transactions: Transaction[];
    }>
  > {
    const response = await apiService.get<{
      date: string;
      totalRevenue: number;
      totalTransactions: number;
      transactions: Transaction[];
    }>('/transactions/daily', { date });
    return response;
  },
};

export default transactionApi;
