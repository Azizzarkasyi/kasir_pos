import type { SalesStatsData } from "../../types/api";

export interface ReportDetailResponse {
  total_penjualan: number;
  total_keuntungan: number;
  total_transaksi: number;
  produk_terjual: number;
  detail_penjualan: {
    penjualan_kotor: number;
    diskon: number;
    biaya_layanan: number;
    pajak: number;
    total: number;
  };
  produk_terlaris: Array<{
    name: string;
    variant_count: number;
  }>;
  wawasan: {
    rata_rata_penjualan_per_hari: number;
    rata_rata_nilai_penjualan_per_transaksi: number;
    jam_paling_ramai: string;
  };
  date_range?: {
    start_date: string;
    end_date: string;
  };
}

import apiService from "../api";

/**
 * Stats API Endpoints
 */
const statsApi = {
  /**
   * Get sales statistics
   * Returns current month sales and today's sales with percentage comparisons
   */
  async getSalesStats(): Promise<SalesStatsData> {
    const response = await apiService.get<SalesStatsData>(
      "/stats/sales"
    );
    if (!response.data) {
      throw new Error('No data received from stats API');
    }
    return response.data;
  },

  /**
   * Get detailed report data
   * Returns comprehensive sales report with breakdowns and insights
   */
  async getReportDetail(startDate?: string, endDate?: string): Promise<ReportDetailResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await apiService.get<ReportDetailResponse>(
      `/stats/report-detail?${params.toString()}`
    );
    if (!response.data) {
      throw new Error('No data received from report detail API');
    }
    return response.data;
  },
};

export default statsApi;
