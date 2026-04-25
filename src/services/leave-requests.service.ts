import api from './api';
import { LeaveRequest } from '@/types';

export const leaveRequestsService = {
  async getLeaveRequests(params?: {
    employee_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<LeaveRequest[]> {
    const { data } = await api.get<LeaveRequest[]>('/leave-requests', { params });
    return data;
  },

  async getLeaveRequestById(id: string): Promise<LeaveRequest> {
    const { data } = await api.get<LeaveRequest>(`/leave-requests/${id}`);
    return data;
  },

  async createLeaveRequest(requestData: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const { data } = await api.post<LeaveRequest>('/leave-requests', requestData);
    return data;
  },

  async updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest> {
    const { data } = await api.patch<LeaveRequest>(`/leave-requests/${id}`, updates);
    return data;
  },

  async approveLeaveRequest(id: string): Promise<LeaveRequest> {
    const { data } = await api.post<LeaveRequest>(`/leave-requests/${id}/approve`);
    return data;
  },

  async rejectLeaveRequest(id: string, reason: string): Promise<LeaveRequest> {
    const { data } = await api.post<LeaveRequest>(`/leave-requests/${id}/reject`, { rejection_reason: reason });
    return data;
  },

  async deleteLeaveRequest(id: string): Promise<void> {
    await api.delete(`/leave-requests/${id}`);
  },
};
