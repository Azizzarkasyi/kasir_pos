/**
 * API Response Types
 */

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Auth Types
export interface LoginRequest {
  phone?: string;
  email?: string;
  pin: string;
  device_id: string;
}

export interface LoginResponse {
  user: User;
  store: {
    id: string;
    name: string;
  } | null;
  branch: {
    id: string;
    name: string;
  } | null;
  access_token: string;
}

export interface RegisterRequest {
  country: string;
  bussiness_name: string;
  business_type: string;
  bussiness_village: {
    id: string;
    name: string;
  };
  bussiness_address: string;
  owner_name: string;
  owner_phone: string;
  pin: string;
  owner_email: string;
  is_accept_tos: boolean;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role?: string;
  plan?: string;
  plan_expired_at?: string;
  is_verified?: boolean;
  is_disabled?: boolean;
}

// Product Types
export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock?: number;
  unit_id?: string;
  unit?: { id: string; name: string };
  notify_on_stock_ronouts?: boolean;
  is_stock_active?: boolean;
  min_stock?: number;
  recipe_id?: string;
  barcode?: string;
  capital_price?: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  merk_id?: string;
  category_id?: string;
  recipe_id?: string;
  is_favorite?: boolean;
  barcode?: string;
  is_ingredient?: boolean;
  is_stock_active?: boolean;
  notify_on_stock_ronouts?: boolean;
  unit_id?: string;
  capital_price?: number;
  stock?: number;
  min_stock?: number;
  photo_url?: string;
  is_disabled?: boolean;
  variants?: ProductVariant[];
  merk?: { id: string; name: string };
  category?: { id: string; name: string };
  unit?: { id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  merk_id?: string;
  category_id?: string;
  recipe_id?: string;
  is_favorite?: boolean;
  barcode?: string;
  is_ingredient?: boolean;
  is_stock_active?: boolean;
  notify_on_stock_ronouts?: boolean;
  unit_id?: string;
  capital_price?: number;
  stock?: number;
  min_stock?: number;
  photo_url?: string;
  variants?: {
    name: string;
    price: number;
    stock?: number;
    unit_id?: string;
    notify_on_stock_ronouts?: boolean;
    is_stock_active?: boolean;
    min_stock?: number;
    recipe_id?: string;
    barcode?: string;
    capital_price?: number;
  }[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> { }

// Category Types
export interface Category {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}

// Merk/Brand Types
export interface Merk {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// Unit Types
export interface Unit {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUnitRequest {
  name: string;
}

export interface UpdateUnitRequest {
  name: string;
}

// Employee Types
export interface Employee {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: string;
  branch_ids: string[];
  salary?: number;
  joinDate?: string;
  status?: "active" | "inactive";
  is_disabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployeeRequest {
  name: string;
  phone: string;
  email: string;
  role: string;
  branch_ids: string[];
  salary?: number;
  joinDate?: string;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  status?: "active" | "inactive";
}

// Transaction Types
export interface AdditionalTransactionIngredient {
  id: string;
  transaction_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  variant: {
    id: string;
    name: string;
    product: {
      id: string;
      name: string;
      is_ingredient: boolean;
    }
  }
}

export interface Transaction {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  sub_total?: number;
  total?: number;
  tax: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: "cash" | "card" | "transfer" | "qris";
  paymentStatus: "paid" | "pending" | "cancelled";
  items: TransactionItem[];
  customerId?: number;
  employeeId?: number;
  cashier: {
    id: string;
    name: string;
  };
  additional_fees: {
    name: string;
    amount: number;
  }[];
  additional_ingredients: AdditionalTransactionIngredient[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CreateTransactionRequest {
  payment_method?: "cash" | "debt" | "qris" | "grab" | "shopee_food" | "bank_transfer" | "e_wallet" | "credit_card" | "debit_card";
  items: {
    product_id: string;
    variant_id?: string;
    quantity: number;
    note?: string;
  }[];
  discount?: number;
  paid_amount: number;
  customer_name?: string;
  note?: string;
  additional_fees?: {
    name: string;
    amount: number;
  }[];
  additional_ingredients?: {
    variant_id: string;
    quantity: number;
  }[];
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Error Response
export interface ApiError {
  code: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Notification Types
export type NotificationCategory = 'INFO' | 'PROMO' | 'ALERT' | 'SYSTEM';
export type NotificationReferenceType = 'TRANSACTION' | 'STOCK' | 'PROMO' | 'SYSTEM';

export interface Notification {
  id: string;
  title: string;
  description: string;
  cta_url: string | null;
  category: NotificationCategory;
  is_read: boolean;
  reference_type: NotificationReferenceType | null;
  reference_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface GetNotificationsResponse {
  data: Notification[];
  meta: NotificationPaginationMeta;
  unread_count: number;
}

export interface UnreadCountData {
  unread_count: number;
}

export interface MarkAsReadData {
  id: string;
  is_read: boolean;
  updated_at: string;
}

export interface FilterNotificationQuery {
  page?: number;
  limit?: number;
  category?: NotificationCategory;
  is_read?: boolean;
}

// Stats Types
export interface SalesStatsData {
  current_month_sales: number;
  current_month_percentage: number;
  today_sales: number;
  today_percentage: number;
  today_expenses: number;
  today_expense_percentage: number;
  current_month_expenses: number;
  current_month_expense_percentage: number;
}

export type GetSalesStatsResponse = ApiResponse<SalesStatsData>;

// Stock History Types
export interface ProductStockHistory {
  id: string;
  action_type: "IN" | "OUT" | "ADJUST" | "CONVERSION";
  amount: number;
  prev_stock: number;
  curr_stock: number;
  type: "add_stock" | "remove_stock" | "adjust_stock" | "sale" | "conversion";
  note: string | null;
  created_at: string;
  product_display_name: string;
  // Conversion fields
  from_unit_id?: string;
  to_unit_id?: string;
  conversion_rate?: number;
  variant: {
    id: string;
    name: string;
    current_stock: number;
  };
  product: {
    id: string;
    name: string;
  };
  branch: {
    id: string;
    name: string;
  } | null;
}

export type GetStockHistoryResponse = PaginatedResponse<ProductStockHistory>;

// Unit Conversion Types
export interface UnitConversion {
  id: string;
  store_id: string;
  from_unit_id: string;
  to_unit_id: string;
  conversion_rate: number;
  created_at: string;
}

export interface CreateUnitConversionRequest {
  from_unit_id: string;
  to_unit_id: string;
  conversion_rate: number;
}

export interface ConvertStockRequest {
  to_unit_id: string;
  amount: number;
  note?: string;
}

export interface AvailableConversion {
  conversion_id: string;
  to_unit_id: string;
  conversion_rate: number;
  result_stock: number;
}

export interface AvailableConversionsResponse {
  variant: {
    id: string;
    name: string;
    product_name: string;
    current_stock: number;
    unit: { id: string; name: string } | null;
  };
  available_conversions: AvailableConversion[];
}

export interface ConvertStockResponse {
  variant_id: string;
  from_unit_id: string;
  to_unit_id: string;
  from_amount: number;
  to_amount: number;
  prev_stock: number;
  curr_stock: number;
  conversion_rate: number;
}
