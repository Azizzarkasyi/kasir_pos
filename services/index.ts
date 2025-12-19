/**
 * Export all API endpoints
 *
 * Usage:
 * import { authApi, productApi, employeeApi, transactionApi, settingsApi } from '@/services';
 */

export { default as apiService } from "./api";
export { default as assetApi } from "./endpoints/assets";
export { default as authApi } from "./endpoints/auth";
export { default as branchApi } from "./endpoints/branches";
export { default as categoryApi } from "./endpoints/categories";
export { default as employeeApi } from "./endpoints/employees";
export { default as merkApi } from "./endpoints/merks";
export { default as notificationApi } from "./endpoints/notifications";
export { default as productApi } from "./endpoints/products";
export { default as recipeApi } from "./endpoints/recipes";
export { default as settingsApi } from "./endpoints/settings";
export { default as statsApi } from "./endpoints/stats";
export { default as transactionApi } from "./endpoints/transactions";
export { default as unitApi } from "./endpoints/units";

// Re-export types for convenience
export type * from "../types/api";
export type { Branch } from "./endpoints/branches";
export type * from "./endpoints/settings";

