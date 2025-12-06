// =============================================
// COMMON TYPES
// =============================================

interface RegencyPayload {
  id: string;
  name: string;
}

interface LocationPayload {
  id: string | number;
  name: string;
}

interface PaginationQuery {
  page?: number;
  limit?: number;
}

// =============================================
// AUTH PAYLOADS
// =============================================

interface RegisterPayload {
  country: string;
  bussiness_name: string;
  business_type: string;
  bussiness_regency: RegencyPayload;
  bussiness_address: string;
  owner_name: string;
  owner_phone: string;
  pin: string;
  owner_email: string;
  is_accept_tos: boolean;
}

interface LoginPayload {
  email?: string;
  phone?: string;
  pin: string;
  device_id: string;
}

interface RequestOtpPayload {
  phone: string;
}

interface ValidateOtpPayload {
  phone: string;
  otp: string;
}

// =============================================
// BRANCH PAYLOADS
// =============================================

interface CreateBranchPayload {
  name: string;
  phone?: string;
  province: LocationPayload;
  city: LocationPayload;
  subdistrict: LocationPayload;
  village: LocationPayload;
  address: string;
  status: string;
}

interface UpdateBranchPayload extends Partial<CreateBranchPayload> { }

// =============================================
// CATEGORY PAYLOADS
// =============================================

interface CreateCategoryPayload {
  name: string;
}

interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> { }

// =============================================
// MERK PAYLOADS
// =============================================

interface CreateMerkPayload {
  name: string;
}

interface UpdateMerkPayload extends Partial<CreateMerkPayload> { }

// =============================================
// UNIT PAYLOADS
// =============================================

interface CreateUnitPayload {
  name: string;
}

interface UpdateUnitPayload extends Partial<CreateUnitPayload> { }

// =============================================
// PRODUCT PAYLOADS
// =============================================

interface CreateProductVariantPayload {
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

interface CreateProductPayload {
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
  variants?: CreateProductVariantPayload[];
}

interface UpdateProductVariantPayload {
  id?: string;
  name: string;
  price: number;
  stock?: number;
  recipe_id?: string;
  unit_id?: string;
  notify_on_stock_ronouts?: boolean;
  is_stock_active?: boolean;
  min_stock?: number;
  barcode?: string;
  capital_price?: number;
}

interface UpdateProductPayload {
  name: string;
  merk_id: string;
  category_id: string;
  is_favorite?: boolean;
  is_ingredient?: boolean;
  photo_url?: string;
  variants?: UpdateProductVariantPayload[];
}

interface FilterProductQuery extends PaginationQuery {
  category_id?: string;
  merk_id?: string;
  favorite?: boolean;
  stock_active?: boolean;
  search?: string;
  branch_id?: string;
  is_product?: boolean;
  is_ingredient?: boolean;
}

interface UpdateStockPayload {
  action_type: 'adjust_stock' | 'add_stock' | 'remove_stock';
  amount: number;
  note?: string;
}

// =============================================
// EMPLOYEE PAYLOADS
// =============================================

interface CreateEmployeePayload {
  name: string;
  email: string;
  phone: string;
  pin: string;
  branch_ids: string[];
  role: 'cashier' | 'manager';
}

interface UpdateEmployeePayload {
  name?: string;
  email?: string;
  phone?: string;
  pin?: string;
  pin_confirmation?: string;
  branch_ids?: string[];
}

interface FilterEmployeeQuery extends PaginationQuery {
  branch_id?: string;
  search?: string;
}

interface InviteEmployeePayload {
  user_id: string;
  branch_ids: string[];
  role?: string;
  is_default_branch?: boolean;
}

// =============================================
// TRANSACTION PAYLOADS
// =============================================

interface CreateTransactionItemPayload {
  product_id: string;
  variant_id?: string;
  quantity: number;
  note?: string;
}

interface CreateTransactionFeePayload {
  name: string;
  amount: number;
}

interface CreateTransactionPayload {
  payment_method: 'cash' | 'debt';
  items: CreateTransactionItemPayload[];
  discount?: number;
  paid_amount: number;
  customer_name?: string;
  note?: string;
  additional_fees?: CreateTransactionFeePayload[];
}

interface FilterTransactionQuery extends PaginationQuery {
  branch_id?: string;
  payment_method?: 'cash' | 'debt';
  status?: string;
  customer_name?: string;
}

// =============================================
// RECIPE PAYLOADS
// =============================================

interface CreateRecipeItemPayload {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

interface CreateRecipePayload {
  name: string;
  is_active?: boolean;
  items: CreateRecipeItemPayload[];
}

interface UpdateRecipePayload {
  name?: string;
  is_active?: boolean;
  items?: CreateRecipeItemPayload[];
}

interface UpdateRecipeStatusPayload {
  is_active: boolean;
}

// =============================================
// SETTINGS PAYLOADS
// =============================================

interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  profile_url?: string;
}

interface UpdatePinPayload {
  old_pin: string;
  new_pin: string;
  new_pin_confirmation: string;
}

interface UpdateStorePayload {
  owner_name?: string;
  bussiness_type?: string;
  tax?: number;
  curency?: string;
  language?: string;
  country?: string;
  province?: LocationPayload;
  subdistrict?: LocationPayload;
  city?: LocationPayload;
  village?: LocationPayload;
  address?: string;
  owner_phone?: string;
}

interface UpdateStruckConfigPayload {
  logo_url?: string;
  footer_description?: string;
  header_description?: string;
  display_transaction_note?: boolean;
  hide_tax_percentage?: boolean;
}

// =============================================
// POS DEVICE PAYLOADS
// =============================================

interface CreatePosDevicePayload {
  name: string;
  device_address: string;
  type: 'printer' | 'scanner' | 'display';
  is_default?: boolean;
  status?: 'active' | 'inactive';
}

interface UpdatePosDevicePayload {
  name?: string;
  device_address?: string;
  type?: 'printer' | 'scanner' | 'display';
  is_default?: boolean;
  status?: 'active' | 'inactive';
}

interface SetDefaultDevicePayload {
  device_id: string;
  type: 'printer' | 'scanner';
}

// =============================================
// ASSET PAYLOADS
// =============================================

// Asset upload uses multipart/form-data with 'file' field
// No specific payload interface needed, handled by FormData
