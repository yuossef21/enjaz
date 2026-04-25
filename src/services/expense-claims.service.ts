import api from './api';
import { ExpenseClaim, ExpenseClaimItem } from '@/types';

export const expenseClaimsService = {
  async getExpenseClaims(params?: {
    employee_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ExpenseClaim[]> {
    const { data } = await api.get<ExpenseClaim[]>('/expense-claims', { params });
    return data;
  },

  async getExpenseClaimById(id: string): Promise<ExpenseClaim> {
    const { data } = await api.get<ExpenseClaim>(`/expense-claims/${id}`);
    return data;
  },

  async createExpenseClaim(
    claimData: Partial<ExpenseClaim>,
    items: Partial<ExpenseClaimItem>[]
  ): Promise<ExpenseClaim> {
    const { data } = await api.post<ExpenseClaim>('/expense-claims', { ...claimData, items });
    return data;
  },

  async submitExpenseClaim(id: string): Promise<ExpenseClaim> {
    const { data } = await api.post<ExpenseClaim>(`/expense-claims/${id}/submit`);
    return data;
  },

  async approveExpenseClaim(id: string): Promise<ExpenseClaim> {
    const { data } = await api.post<ExpenseClaim>(`/expense-claims/${id}/approve`);
    return data;
  },

  async rejectExpenseClaim(id: string, reason: string): Promise<ExpenseClaim> {
    const { data } = await api.post<ExpenseClaim>(`/expense-claims/${id}/reject`, { rejection_reason: reason });
    return data;
  },

  async markAsPaid(id: string): Promise<ExpenseClaim> {
    const { data } = await api.post<ExpenseClaim>(`/expense-claims/${id}/pay`);
    return data;
  },

  async deleteExpenseClaim(id: string): Promise<void> {
    await api.delete(`/expense-claims/${id}`);
  },
};
