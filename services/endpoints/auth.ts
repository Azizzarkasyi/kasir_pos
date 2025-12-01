import apiService from "../api";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ApiResponse,
  User,
} from "../../types/api";

/**
 * Authentication API Endpoints
 */
export const authApi = {
  /**
   * Login user
   */
  async login(
    credential: string,
    pin: string,
    isPhone: boolean = true
  ): Promise<LoginResponse> {
    // Generate device_id (bisa dari device info atau random)
    const deviceId = `device-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const requestBody: LoginRequest = {
      pin,
      device_id: deviceId,
    };

    // Set phone atau email based on login type
    if (isPhone) {
      requestBody.phone = credential;
    } else {
      requestBody.email = credential;
    }

    const response = await apiService.post<LoginResponse>(
      "/auth/login",
      requestBody
    );

    // Save token if login successful
    if (response.data?.access_token) {
      console.log("🔑 Saving token to storage...");
      await apiService.setToken(response.data.access_token);
      console.log("✅ Token saved successfully");
    } else {
      console.warn("⚠️ No access token in login response");
    }

    return response.data!;
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    const response = await apiService.post<User>("/auth/register", data);

    // Optionally auto-login after successful registration
    // if (response.data?.token) {
    //   await apiService.setToken(response.data.token);
    // }

    return response;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      await apiService.post("/auth/logout");
    } catch (error) {
      console.error("Backend logout error:", error);
      // Continue with local logout even if backend fails
    }

    // Clear token
    await apiService.clearToken();

    // Clear other stored data
    const AsyncStorage = await import(
      "@react-native-async-storage/async-storage"
    );
    await AsyncStorage.default.multiRemove([
      "auth_token",
      "current_branch_id",
      "current_branch_name",
    ]);
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await apiService.get<User>("/auth/profile");
    return response;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiService.isAuthenticated();
  },

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return apiService.getToken();
  },

  /**
   * Set auth token manually
   */
  async setToken(token: string): Promise<void> {
    await apiService.setToken(token);
  },

  /**
   * Get user branches
   */
  async getUserBranches(): Promise<ApiResponse<any[]>> {
    const response = await apiService.get<any[]>("/auth/branches");
    return response;
  },
};

export default authApi;
