import api from './api';
import { PaymentVoucher } from '@/types';

export const paymentVouchersService = {
  async getPaymentVouchers(params?: {
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaymentVoucher[]> {
    const { data } = await api.get<PaymentVoucher[]>('/payment-vouchers', { params });
    return data;
  },

  async getPaymentVoucherById(id: string): Promise<PaymentVoucher> {
    const { data } = await api.get<PaymentVoucher>(`/payment-vouchers/${id}`);
    return data;
  },

  async createPaymentVoucher(voucherData: Partial<PaymentVoucher>): Promise<PaymentVoucher> {
    const { data } = await api.post<PaymentVoucher>('/payment-vouchers', voucherData);
    return data;
  },

  async updatePaymentVoucher(id: string, updates: Partial<PaymentVoucher>): Promise<PaymentVoucher> {
    const { data } = await api.patch<PaymentVoucher>(`/payment-vouchers/${id}`, updates);
    return data;
  },

  async approvePaymentVoucher(id: string): Promise<PaymentVoucher> {
    const { data } = await api.post<PaymentVoucher>(`/payment-vouchers/${id}/approve`);
    return data;
  },

  async postPaymentVoucher(id: string): Promise<PaymentVoucher> {
    const { data } = await api.post<PaymentVoucher>(`/payment-vouchers/${id}/post`);
    return data;
  },

  async deletePaymentVoucher(id: string): Promise<void> {
    await api.delete(`/payment-vouchers/${id}`);
  },
};
