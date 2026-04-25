import api from './api';
import { Employee } from '@/types';

export const employeesService = {
  async getEmployees(params?: {
    department?: string;
    status?: string;
  }): Promise<Employee[]> {
    const { data } = await api.get<Employee[]>('/employees', { params });
    return data;
  },

  async getEmployeeById(id: string): Promise<Employee> {
    const { data } = await api.get<Employee>(`/employees/${id}`);
    return data;
  },

  async createEmployee(employeeData: Partial<Employee>): Promise<Employee> {
    const { data } = await api.post<Employee>('/employees', employeeData);
    return data;
  },

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const { data } = await api.patch<Employee>(`/employees/${id}`, updates);
    return data;
  },

  async deleteEmployee(id: string): Promise<void> {
    await api.delete(`/employees/${id}`);
  },
};
