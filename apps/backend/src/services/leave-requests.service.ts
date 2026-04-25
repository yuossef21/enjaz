import { supabase } from '../config/database.js';
import { LeaveRequest } from '../models/hr-types.js';

export const leaveRequestsService = {
  async getLeaveRequests(filters?: {
    employee_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) {
    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees(id, employee_code, full_name)
      `)
      .order('created_at', { ascending: false });

    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.start_date) {
      query = query.gte('start_date', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('end_date', filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getLeaveRequestById(id: string) {
    const { data, error } = await supabase
      .from('leave_requests')
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

  async createLeaveRequest(requestData: Partial<LeaveRequest>) {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert(requestData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateLeaveRequest(id: string, updates: Partial<LeaveRequest>) {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async approveLeaveRequest(id: string, approvedBy: string) {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
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

  async rejectLeaveRequest(id: string, rejectionReason: string) {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
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

  async deleteLeaveRequest(id: string) {
    const { error } = await supabase
      .from('leave_requests')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },
};
