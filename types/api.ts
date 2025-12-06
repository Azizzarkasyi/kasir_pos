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
  is_verified?: boolean
}

// Product Types
export interface ProductVariant {
  id: string;
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
  variants?: ProductVariant[];
  merk?: {id: string; name: string};
  category?: {id: string; name: string};
  unit?: {id: string; name: string};
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

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

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
export interface Transaction {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: "cash" | "card" | "transfer" | "qris";
  paymentStatus: "paid" | "pending" | "cancelled";
  items: TransactionItem[];
  customerId?: number;
  employeeId?: number;
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
  payment_method: "cash" | "debt";
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
