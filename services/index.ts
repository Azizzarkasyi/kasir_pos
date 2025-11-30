/**
 * Export all API endpoints
 *
 * Usage:
 * import { authApi, productApi, employeeApi, transactionApi, settingsApi } from '@/services';
 */

export {default as authApi} from "./endpoints/auth";
export {default as productApi} from "./endpoints/products";
export {default as categoryApi} from "./endpoints/categories";
export {default as merkApi} from "./endpoints/merks";
export {default as employeeApi} from "./endpoints/employees";
export {default as transactionApi} from "./endpoints/transactions";
export {default as settingsApi} from "./endpoints/settings";
export {default as apiService} from "./api";

// Re-export types for convenience
export type * from "../types/api";
export type * from "./endpoints/settings";
