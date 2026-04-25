import { supabase } from '../config/database.js';
import { ReceiptVoucher } from '../models/accounting-types.js';

export const receiptVouchersService = {
  async getReceiptVouchers(filters?: {
    status?: string;
    start_date?: string;
    end_date?: string;
  }) {
    let query = supabase
      .from('receipt_vouchers')
      .select(`
        *,
        account:accounts(id, code, name_ar),
        creator:users!receipt_vouchers_created_by_fkey(id, full_name, email),
        approver:users!receipt_vouchers_approved_by_fkey(id, full_name, email)
      `)
      .order('voucher_date', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.start_date) {
      query = query.gte('voucher_date', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('voucher_date', filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getReceiptVoucherById(id: string) {
    const { data, error } = await supabase
      .from('receipt_vouchers')
      .select(`
        *,
        account:accounts(id, code, name_ar),
        creator:users!receipt_vouchers_created_by_fkey(id, full_name, email),
        approver:users!receipt_vouchers_approved_by_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createReceiptVoucher(voucherData: Partial<ReceiptVoucher>) {
    // Generate voucher number
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('receipt_vouchers')
      .select('*', { count: 'exact', head: true })
      .like('voucher_number', `RV-${year}-%`);

    const voucherNumber = `RV-${year}-${String((count || 0) + 1).padStart(5, '0')}`;

    const { data, error } = await supabase
      .from('receipt_vouchers')
      .insert({
        ...voucherData,
        voucher_number: voucherNumber,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateReceiptVoucher(id: string, updates: Partial<ReceiptVoucher>) {
    const { data, error } = await supabase
      .from('receipt_vouchers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async approveReceiptVoucher(id: string, approvedBy: string) {
    const { data, error } = await supabase
      .from('receipt_vouchers')
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

  async postReceiptVoucher(id: string) {
    const { data, error } = await supabase
      .from('receipt_vouchers')
      .update({
        status: 'posted',
        posted_at: new Date().toISOString(),
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

  async deleteReceiptVoucher(id: string) {
    const { error } = await supabase
      .from('receipt_vouchers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },
};
