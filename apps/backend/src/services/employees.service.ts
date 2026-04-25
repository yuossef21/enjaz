import { supabase } from '../config/database.js';
import { Employee } from '../models/hr-types.js';

export const employeesService = {
  async getEmployees(filters?: {
    department?: string;
    status?: string;
  }) {
    let query = supabase
      .from('employees')
      .select('*')
      .order('hire_date', { ascending: false });

    if (filters?.department) {
      query = query.eq('department', filters.department);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getEmployeeById(id: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createEmployee(employeeData: Partial<Employee>) {
    // Generate employee code
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .like('employee_code', `EMP-${year}-%`);

    const employeeCode = `EMP-${year}-${String((count || 0) + 1).padStart(4, '0')}`;

    const { data, error } = await supabase
      .from('employees')
      .insert({
        ...employeeData,
        employee_code: employeeCode,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateEmployee(id: string, updates: Partial<Employee>) {
    const { data, error } = await supabase
      .from('employees')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async deleteEmployee(id: string) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },
};
