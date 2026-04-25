import { supabase } from '../config/database.js';
import { Customer } from '../models/accounting-types.js';

export const customersService = {
  async getCustomers(filters?: {
    search?: string;
    customer_type?: string;
    is_active?: boolean;
  }) {
    let query = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.or(`name_ar.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,customer_code.ilike.%${filters.search}%`);
    }

    if (filters?.customer_type) {
      query = query.eq('customer_type', filters.customer_type);
    }

    if (typeof filters?.is_active === 'boolean') {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getCustomerById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createCustomer(customerData: Partial<Customer>) {
    // Generate customer code
    const { count } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    const customerCode = `CUST-${String((count || 0) + 1).padStart(5, '0')}`;

    const { data, error } = await supabase
      .from('customers')
      .insert({
        ...customerData,
        customer_code: customerCode,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateCustomer(id: string, updates: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async deleteCustomer(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async getCustomerInvoices(customerId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .order('invoice_date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateCustomerBalance(customerId: string, amount: number) {
    const customer = await this.getCustomerById(customerId);
    const newBalance = (customer.current_balance || 0) + amount;

    const { data, error } = await supabase
      .from('customers')
      .update({
        current_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
};
