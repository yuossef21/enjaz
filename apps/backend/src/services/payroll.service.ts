import { supabase } from '../config/database.js';
import { PayrollRecord } from '../models/hr-types.js';

export const payrollService = {
  async getPayrollRecords(filters?: {
    employee_id?: string;
    month?: string;
    year?: number;
    status?: string;
  }) {
    let query = supabase
      .from('payroll_records')
      .select(`
        *,
        employee:employees(id, employee_code, full_name)
      `)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }

    if (filters?.month) {
      query = query.eq('month', filters.month);
    }

    if (filters?.year) {
      query = query.eq('year', filters.year);
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

  async getPayrollRecordById(id: string) {
    const { data, error } = await supabase
      .from('payroll_records')
      .select(`
        *,
        employee:employees(id, employee_code, full_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createPayrollRecord(recordData: Partial<PayrollRecord>) {
    const netSalary =
      (recordData.basic_salary || 0) +
      (recordData.allowances || 0) -
      (recordData.deductions || 0);

    const { data, error } = await supabase
      .from('payroll_records')
      .insert({
        ...recordData,
        net_salary: netSalary,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updatePayrollRecord(id: string, updates: Partial<PayrollRecord>) {
    if (updates.basic_salary || updates.allowances || updates.deductions) {
      const current = await this.getPayrollRecordById(id);
      const netSalary =
        (updates.basic_salary ?? current.basic_salary) +
        (updates.allowances ?? current.allowances) -
        (updates.deductions ?? current.deductions);
      updates.net_salary = netSalary;
    }

    const { data, error } = await supabase
      .from('payroll_records')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async approvePayrollRecord(id: string) {
    const { data, error } = await supabase
      .from('payroll_records')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async markAsPaid(id: string) {
    const { data, error } = await supabase
      .from('payroll_records')
      .update({
        status: 'paid',
        payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async deletePayrollRecord(id: string) {
    const { error } = await supabase
      .from('payroll_records')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },
};
