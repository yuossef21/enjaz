import api from './api';
import { ReceiptVoucher } from '@/types';

export const receiptVouchersService = {
  async getReceiptVouchers(params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ReceiptVoucher[]> {
    const { data } = await api.get<ReceiptVoucher[]>('/receipt-vouchers', { params });
    return data;
  },

  async getReceiptVoucherById(id: string): Promise<ReceiptVoucher> {
    const { data } = await api.get<ReceiptVoucher>(`/receipt-vouchers/${id}`);
    return data;
  },

  async createReceiptVoucher(voucherData: Partial<ReceiptVoucher>): Promise<ReceiptVoucher> {
    const { data } = await api.post<ReceiptVoucher>('/receipt-vouchers', voucherData);
    return data;
  },

  async updateReceiptVoucher(id: string, updates: Partial<ReceiptVoucher>): Promise<ReceiptVoucher> {
    const { data } = await api.patch<ReceiptVoucher>(`/receipt-vouchers/${id}`, updates);
    return data;
  },

  async approveReceiptVoucher(id: string): Promise<ReceiptVoucher> {
    const { data } = await api.post<ReceiptVoucher>(`/receipt-vouchers/${id}/approve`);
    return data;
  },

  async postReceiptVoucher(id: string): Promise<ReceiptVoucher> {
    const { data } = await api.post<ReceiptVoucher>(`/receipt-vouchers/${id}/post`);
    return data;
  },

  async deleteReceiptVoucher(id: string): Promise<void> {
    await api.delete(`/receipt-vouchers/${id}`);
  },
};
