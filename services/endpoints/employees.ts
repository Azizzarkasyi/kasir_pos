import {
  ApiResponse,
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest,
} from '../../types/api';
import apiService from '../api';

/**
 * Employee API Endpoints
 */
export const employeeApi = {
  /**
   * Get all employees
   */
  async getEmployees(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
  }): Promise<ApiResponse<Employee[]>> {
    const response = await apiService.get<Employee[]>('/employees', params);
    return response;
  },

  /**
   * Get employee by ID
   */
  async getEmployee(id: string): Promise<ApiResponse<Employee>> {
    const response = await apiService.get<Employee>(`/employees/${id}`);
    return response;
  },

  /**
   * Create new employee
   */
  async createEmployee(data: CreateEmployeeRequest): Promise<ApiResponse<Employee>> {
    const response = await apiService.post<Employee>('/employees', data);
    return response;
  },

  /**
   * Update employee
   */
  async updateEmployee(
    id: number,
    data: UpdateEmployeeRequest
  ): Promise<ApiResponse<Employee>> {
    const response = await apiService.put<Employee>(`/employees/${id}`, data);
    return response;
  },

  /**
   * Delete employee
   */
  async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>(`/employees/${id}`);
    return response;
  },

  /**
   * Update employee status
   */
  async updateStatus(
    id: number,
    status: 'active' | 'inactive'
  ): Promise<ApiResponse<Employee>> {
    const response = await apiService.patch<Employee>(`/employees/${id}/status`, {
      status,
    });
    return response;
  },
};

export default employeeApi;
