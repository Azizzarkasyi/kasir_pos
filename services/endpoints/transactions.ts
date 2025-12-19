import {
  ApiResponse,
  CreateTransactionRequest,
  Transaction,
} from "../../types/api";
import apiService from "../api";

/**
 * Transform transaction from snake_case to camelCase
 */
const transformTransaction = (data: any): Transaction => {
  // Generate invoice number if not present
  const invoiceNumber =
    data.invoice_number || data.invoiceNumber || `TRX-${data.id}`;

  return {
    id: data.id,
    invoiceNumber: invoiceNumber,
    totalAmount: data.total_amount || data.total || data.totalAmount || 0,
    sub_total: data.sub_total || data.subtotal || 0,
    total: data.total || data.total_amount || 0,
    paidAmount: data.paid_amount || data.paid || data.paidAmount || 0,
    changeAmount: data.change_amount || data.change || data.changeAmount || 0,
    cashier: {
      id: data.cashier_id || data.cashierId,
      name: data.cashier?.name || data.cashierName,
    },
    additional_fees: data.additional_fees || data.additionalFees || [],
    paymentMethod: (
      data.payment_method || data.paymentMethod
    )?.toLowerCase() as any,
    paymentStatus: 
      data.status  as any,
    items: (data.items || []).map((item: any) => ({
      id: item.id,
      productId: item.product_id || item.productId,
      productName:
        item.product?.name || item.productName || item.name || "Item",
      quantity: item.quantity || 0,
      price: item.price || item.product?.price || item.variant?.price || 0,
      subtotal: item.subtotal || item.quantity * (item.price || 0),
    })),
    customerId: data.customer_id || data.customerId,
    employeeId: data.employee_id || data.cashier_id || data.employeeId,
    notes: data.notes || data.note || "",
    tax: data.tax || data.taxAmount || 0,
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    updatedAt: data.updated_at || data.updatedAt,
  };
};

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
    branch_id?: string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    search?: string;
  }): Promise<ApiResponse<Transaction[]>> {
    const response = await apiService.get<any[]>("/transactions", params);

    // Transform response
    if (response.data) {
      response.data = response.data.map(transformTransaction);
    }

    return response as ApiResponse<Transaction[]>;
  },

  /**
   * Get transaction by ID
   */
  async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    const response = await apiService.get<any>(`/transactions/${id}`);

    // Transform response
    if (response.data) {
      response.data = transformTransaction(response.data);
    }

    return response as ApiResponse<Transaction>;
  },

  /**
   * Create new transaction
   */
  async createTransaction(
    data: CreateTransactionRequest
  ): Promise<ApiResponse<Transaction>> {
    const response = await apiService.post<any>("/transactions", data);

    // Transform response
    if (response.data) {
      response.data = transformTransaction(response.data);
    }

    return response as ApiResponse<Transaction>;
  },

  /**
   * Cancel transaction
   */
  async cancelTransaction(id: number): Promise<ApiResponse<Transaction>> {
    const response = await apiService.patch<any>(`/transactions/${id}/cancel`);

    // Transform response
    if (response.data) {
      response.data = transformTransaction(response.data);
    }

    return response as ApiResponse<Transaction>;
  },

  /**
   * Get transaction statistics
   */
  async getStats(params?: { startDate?: string; endDate?: string }): Promise<
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
    }>("/transactions/stats", params);
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
    }>("/transactions/daily", { date });
    return response;
  },
};

export default transactionApi;
