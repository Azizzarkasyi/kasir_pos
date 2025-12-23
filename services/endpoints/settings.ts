import { ApiResponse } from "../../types/api";
import apiService from "../api";

/**
 * Settings API Types
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile_url?: string;
  role: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  profile_url?: string;
}

export interface ChangePinRequest {
  old_pin: string;
  new_pin: string;
  new_pin_confirmation: string;
}

export interface StoreInfo {
  id: string;
  owner_name: string;
  bussiness_type: string;
  tax: number;
  curency: string;
  language: string;
  country: string;
  province: any;
  city: any;
  subdistrict: any;
  village: any;
  address: string;
  owner_phone: string;
  photo?: string;
  branches?: Array<{
    id: string;
    name: string;
    phone: string;
    address: string;
    status: string;
    province?: {
      id: string;
      name: string;
    };
    city?: {
      id: string;
      name: string;
    };
    subdistrict?: {
      id: string;
      name: string;
    };
    village?: {
      id: string;
      name: string;
    };
  }>;
}

export interface UpdateStoreRequest {
  owner_name?: string;
  bussiness_type?: string;
  tax?: number;
  language?: string;
  country?: string;
  province?: any;
  city?: any;
  subdistrict?: any;
  village?: any;
  address?: string;
  photo?: string;
}

export interface StruckConfig {
  id: string;
  branch_id: string;
  logo_url?: string;
  footer_description?: string;
  header_description?: string;
  display_transaction_note?: boolean;
  hide_tax_percentage?: boolean;
  display_running_number?: boolean;
  display_unit_next_to_qty?: boolean;
}

export interface UpdateStruckConfigRequest {
  logo_url?: string;
  footer_description?: string;
  header_description?: string;
  display_transaction_note?: boolean;
  hide_tax_percentage?: boolean;
  display_running_number?: boolean;
  display_unit_next_to_qty?: boolean;
}

/**
 * Settings API Endpoints
 */
export const settingsApi = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    const response = await apiService.get<UserProfile>("/profile");
    return response;
  },

  /**
   * Update user profile
   */
  async updateProfile(
    data: UpdateProfileRequest
  ): Promise<ApiResponse<UserProfile>> {
    const response = await apiService.put<UserProfile>("/profile", data);
    return response;
  },

  /**
   * Change PIN
   */
  async changePin(data: ChangePinRequest): Promise<ApiResponse<void>> {
    const response = await apiService.put<void>("/account/pin", data);
    return response;
  },

  /**
   * Delete account
   */
  async deleteAccount(): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>("/account/delete");
    return response;
  },

  /**
   * Get store information
   */
  async getStoreInfo(): Promise<ApiResponse<StoreInfo>> {
    const response = await apiService.get<StoreInfo>("/setting/store");
    return response;
  },

  /**
   * Update store information
   */
  async updateStore(data: UpdateStoreRequest): Promise<ApiResponse<StoreInfo>> {
    const response = await apiService.put<StoreInfo>("/setting/store", data);
    return response;
  },

  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(
    file: FormData
  ): Promise<ApiResponse<{ url: string }>> {
    const instance = apiService.getInstance();
    const response = await instance.post<ApiResponse<{ url: string }>>(
      "/auth/upload-photo",
      file,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Upload store photo
   */
  async uploadStorePhoto(
    storeId: string,
    file: FormData
  ): Promise<ApiResponse<{ url: string }>> {
    const instance = apiService.getInstance();
    const response = await instance.post<ApiResponse<{ url: string }>>(
      `/stores/${storeId}/upload-photo`,
      file,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Sync data from server
   */
  async syncData(): Promise<ApiResponse<{ last_sync: string }>> {
    const response = await apiService.post<{ last_sync: string }>("/sync/data");
    return response;
  },

  /**
   * Get last sync time
   */
  async getLastSyncTime(): Promise<ApiResponse<{ last_sync: string }>> {
    const response = await apiService.get<{ last_sync: string }>("/sync/last");
    return response;
  },

  /**
   * Get struck config for branch
   */
  async getStruckConfig(branchId: string): Promise<ApiResponse<StruckConfig>> {
    const response = await apiService.get<StruckConfig>(
      `/setting/struck/${branchId}`
    );
    return response;
  },

  /**
   * Update struck config for branch
   */
  async updateStruckConfig(
    branchId: string,
    data: UpdateStruckConfigRequest
  ): Promise<ApiResponse<StruckConfig>> {
    const response = await apiService.put<StruckConfig>(
      `/setting/struck/${branchId}`,
      data
    );
    return response;
  },
};

export default settingsApi;
