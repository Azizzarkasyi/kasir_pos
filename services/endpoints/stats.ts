import {GetSalesStatsResponse} from "../../types/api";
import apiService from "../api";

/**
 * Stats API Endpoints
 */
const statsApi = {
  /**
   * Get sales statistics
   * Returns current month sales and today's sales with percentage comparisons
   */
  async getSalesStats(): Promise<GetSalesStatsResponse> {
    const response = await apiService.get<GetSalesStatsResponse>(
      "/stats/sales"
    );
    return response;
  },
};

export default statsApi;
