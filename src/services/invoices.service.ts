import api from './api';
import { Invoice, InvoiceLine } from '@/types';

export const invoicesService = {
  async getInvoices(params?: {
    status?: string;
    customer_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Invoice[]> {
    const { data } = await api.get<Invoice[]>('/invoices', { params });
    return data;
  },

  async getInvoiceById(id: string): Promise<Invoice> {
    const { data } = await api.get<Invoice>(`/invoices/${id}`);
    return data;
  },

  async createInvoice(invoiceData: Partial<Invoice>, lines: Partial<InvoiceLine>[]): Promise<Invoice> {
    const { data } = await api.post<Invoice>('/invoices', { ...invoiceData, lines });
    return data;
  },

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const { data } = await api.patch<Invoice>(`/invoices/${id}`, updates);
    return data;
  },

  async updateInvoiceStatus(id: string, status: string): Promise<Invoice> {
    const { data } = await api.patch<Invoice>(`/invoices/${id}/status`, { status });
    return data;
  },

  async recordPayment(id: string, amount: number): Promise<Invoice> {
    const { data } = await api.post<Invoice>(`/invoices/${id}/payment`, { amount });
    return data;
  },

  async deleteInvoice(id: string): Promise<void> {
    await api.delete(`/invoices/${id}`);
  },

  async getInvoiceStats(): Promise<any> {
    const { data } = await api.get('/invoices/stats');
    return data;
  },
};
