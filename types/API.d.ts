// =============================================
// BASE API RESPONSE TYPES
// =============================================

interface ApiResponse<T = any> {
  message: string;
  data?: T;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginatedResponse<T> {
  message: string;
  data: T[];
  meta: PaginationMeta;
}

interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

// =============================================
// COMMON DATA TYPES
// =============================================

interface LocationData {
  id: string | number;
  name: string;
}

// =============================================
// AUTH RESPONSES
// =============================================

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  country: string;
  profile_url: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface BranchAccessData {
  id: string;
  branch_id: string;
  role: string;
  is_default_brach: boolean;
  branch: BranchData;
}

interface RegisterResponseData {
  user: UserData;
  access_token: string;
}

interface LoginResponseData {
  user: UserData;
  access_token: string;
  branches: BranchAccessData[];
}

interface RequestOtpResponseData {
  message: string;
}

interface ValidateOtpResponseData {
  valid: boolean;
}

interface LogoutResponseData {
  message: string;
}

interface GetBranchesResponseData {
  branches: BranchAccessData[];
}

// =============================================
// BRANCH RESPONSES
// =============================================

interface BranchData {
  id: string;
  store_id: string;
  name: string;
  phone: string | null;
  province: LocationData;
  city: LocationData;
  subdistrict: LocationData;
  village: LocationData;
  address: string;
  status: string;
  created_at: string;
  updated_at: string;
}

type CreateBranchResponse = ApiResponse<BranchData>;
type GetBranchesResponse = ApiResponse<BranchData[]>;
type GetBranchResponse = ApiResponse<BranchData>;
type UpdateBranchResponse = ApiResponse<BranchData>;
type DeleteBranchResponse = ApiResponse<null>;

// =============================================
// CATEGORY RESPONSES
// =============================================

interface CategoryData {
  id: string;
  name: string;
  store_id: string;
  created_at: string;
  updated_at: string;
}

type CreateCategoryResponse = ApiResponse<CategoryData>;
type GetCategoriesResponse = ApiResponse<CategoryData[]>;
type GetCategoryResponse = ApiResponse<CategoryData>;
type UpdateCategoryResponse = ApiResponse<CategoryData>;
type DeleteCategoryResponse = ApiResponse<null>;

// =============================================
// MERK RESPONSES
// =============================================

interface MerkData {
  id: string;
  name: string;
  store_id: string;
  created_at: string;
  updated_at: string;
}

type CreateMerkResponse = ApiResponse<MerkData>;
type GetMerksResponse = ApiResponse<MerkData[]>;
type GetMerkResponse = ApiResponse<MerkData>;
type UpdateMerkResponse = ApiResponse<MerkData>;
type DeleteMerkResponse = ApiResponse<null>;

// =============================================
// UNIT RESPONSES
// =============================================

interface UnitData {
  id: string;
  name: string;
  store_id: string;
  created_at: string;
  updated_at: string;
}

type CreateUnitResponse = ApiResponse<UnitData>;
type GetUnitsResponse = ApiResponse<UnitData[]>;
type GetUnitResponse = ApiResponse<UnitData>;
type UpdateUnitResponse = ApiResponse<UnitData>;
type DeleteUnitResponse = ApiResponse<null>;

// =============================================
// PRODUCT RESPONSES
// =============================================

interface ProductVariantData {
  id: string;
  name: string;
  price: number;
  stock: number;
  unit_id: string | null;
  product_id: string;
  notify_on_stock_ronouts: boolean;
  is_stock_active: boolean;
  recipe_id: string | null;
  is_default: boolean;
  min_stock: number | null;
  barcode: string | null;
  capital_price: number | null;
  created_at: string;
  updated_at: string;
  unit?: UnitData | null;
  recipe?: RecipeData | null;
}

interface ProductBranchMetaData {
  id: string;
  product_id: string;
  branch_id: string;
  is_available: boolean | null;
  custom_name: string | null;
  created_at: string;
  updated_at: string;
}

interface ProductData {
  id: string;
  name: string;
  merk_id: string | null;
  category_id: string | null;
  is_favorit: boolean;
  is_ingredient: boolean;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  variants: ProductVariantData[];
  category?: CategoryData | null;
  merk?: MerkData | null;
  branch_meta?: ProductBranchMetaData[];
}

interface StockData {
  variant_id: string;
  variant_name: string;
  product_id: string;
  product_name: string;
  stock: number;
  min_stock: number | null;
  is_stock_active: boolean;
  unit?: UnitData | null;
}

type CreateProductResponse = ApiResponse<ProductData>;
type GetProductsResponse = PaginatedResponse<ProductData>;
type GetProductResponse = ApiResponse<ProductData>;
type UpdateProductResponse = ApiResponse<ProductData>;
type DeleteProductResponse = ApiResponse<null>;
type UpdateStockResponse = ApiResponse<ProductVariantData>;
type GetStocksResponse = ApiResponse<StockData[]>;
type AddFromBranchResponse = ApiResponse<ProductData>;

// =============================================
// EMPLOYEE RESPONSES
// =============================================

interface EmployeeData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  country: string;
  profile_url: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  branch_accesses?: BranchAccessData[];
}

type CreateEmployeeResponse = ApiResponse<EmployeeData>;
type GetEmployeesResponse = PaginatedResponse<EmployeeData>;
type GetEmployeeResponse = ApiResponse<EmployeeData>;
type UpdateEmployeeResponse = ApiResponse<EmployeeData>;
type DeleteEmployeeResponse = ApiResponse<null>;
type InviteEmployeeResponse = ApiResponse<BranchAccessData>;
type RemoveBranchAccessResponse = ApiResponse<null>;

// =============================================
// TRANSACTION RESPONSES
// =============================================

interface TransactionItemData {
  transaction_id: string;
  product_id: string;
  quantity: number;
  variant_id: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  product: ProductData;
  variant?: ProductVariantData | null;
}

interface AdditionalFeeData {
  id: string;
  transaction_id: string;
  name: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

interface TransactionData {
  id: string;
  branch_id: string;
  payment_method: 'CASH' | 'DEBT';
  status: string;
  discount: number;
  tax: number;
  sub_total: number;
  total: number;
  cashier_id: string | null;
  paid_amount: number;
  change_amount: number;
  note: string;
  struck_url: string;
  customer_name: string;
  created_at: string;
  updated_at: string;
  items: TransactionItemData[];
  additional_fees: AdditionalFeeData[];
  branch?: BranchData;
  cashier?: UserData | null;
}

type CreateTransactionResponse = ApiResponse<TransactionData>;
type GetTransactionsResponse = PaginatedResponse<TransactionData>;
type GetTransactionResponse = ApiResponse<TransactionData>;
type CancelTransactionResponse = ApiResponse<TransactionData>;

// =============================================
// RECIPE RESPONSES
// =============================================

interface RecipeItemData {
  recipe_id: string;
  product_id: string;
  quantity: number;
  productVariantId: string | null;
  created_at: string;
  updated_at: string;
  product?: ProductData;
  productVariant?: ProductVariantData | null;
}

interface RecipeData {
  id: string;
  name: string;
  is_active: boolean;
  store_id: string;
  created_at: string;
  updated_at: string;
  items: RecipeItemData[];
}

type CreateRecipeResponse = ApiResponse<RecipeData>;
type GetRecipesResponse = ApiResponse<RecipeData[]>;
type GetRecipeResponse = ApiResponse<RecipeData>;
type UpdateRecipeResponse = ApiResponse<RecipeData>;
type DeleteRecipeResponse = ApiResponse<null>;
type UpdateRecipeStatusResponse = ApiResponse<RecipeData>;

// =============================================
// SETTINGS RESPONSES
// =============================================

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  country: string;
  profile_url: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface StoreData {
  id: string;
  owner_name: string;
  bussiness_type: string;
  tax: number;
  curency: string;
  language: string;
  country: string;
  province: LocationData;
  subdistrict: LocationData;
  city: LocationData;
  village: LocationData;
  address: string;
  owner_id: string;
  owner_phone: string;
  created_at: string;
  updated_at: string;
}

interface StruckConfigData {
  id: string;
  logo_url: string;
  branch_id: string;
  footer_description: string;
  header_description: string;
  display_transaction_note: boolean;
  hide_tax_percentage: boolean;
  created_at: string;
  updated_at: string;
}

type GetProfileResponse = ApiResponse<ProfileData>;
type UpdateProfileResponse = ApiResponse<ProfileData>;
type DeleteAccountResponse = ApiResponse<null>;
type UpdatePinResponse = ApiResponse<null>;
type GetStoreResponse = ApiResponse<StoreData>;
type UpdateStoreResponse = ApiResponse<StoreData>;
type GetStruckConfigResponse = ApiResponse<StruckConfigData>;
type UpdateStruckConfigResponse = ApiResponse<StruckConfigData>;

// =============================================
// POS DEVICE RESPONSES
// =============================================

interface PosDeviceData {
  id: string;
  name: string;
  device_address: string;
  type: string;
  is_default: boolean;
  branch_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

type CreatePosDeviceResponse = ApiResponse<PosDeviceData>;
type GetPosDevicesResponse = ApiResponse<PosDeviceData[]>;
type UpdatePosDeviceResponse = ApiResponse<PosDeviceData>;
type DeletePosDeviceResponse = ApiResponse<null>;
type SetDefaultDeviceResponse = ApiResponse<PosDeviceData>;

// =============================================
// STATS RESPONSES
// =============================================

interface SalesStatsData {
  current_month_sales: number;
  current_month_percentage: number;
  today_sales: number;
  today_percentage: number;
}

type GetSalesStatsResponse = ApiResponse<SalesStatsData>;

// =============================================
// ASSET RESPONSES
// =============================================

interface AssetUploadData {
  url: string;
  filename: string;
}

type UploadAssetResponse = ApiResponse<AssetUploadData>;

// =============================================
// APP RESPONSES
// =============================================

interface AppInfoData {
  message: string;
  version: string;
  status: string;
  timestamp: string;
  endpoints: {
    health: string;
    docs: string;
  };
}

interface HealthData {
  status: string;
  uptime: number;
  timestamp: string;
  database: string;
}

type GetAppInfoResponse = AppInfoData;
type GetHealthResponse = HealthData;
