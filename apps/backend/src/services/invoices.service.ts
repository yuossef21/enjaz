import { supabase } from '../config/database.js';
import { Invoice, InvoiceLine } from '../models/accounting-types.js';

export const invoicesService = {
  async getInvoices(filters?: {
    status?: string;
    customer_id?: string;
    start_date?: string;
    end_date?: string;
  }) {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(id, customer_code, name_ar, phone),
        creator:users!invoices_created_by_fkey(id, full_name, email)
      `)
      .order('invoice_date', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }

    if (filters?.start_date) {
      query = query.gte('invoice_date', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('invoice_date', filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getInvoiceById(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(id, customer_code, name_ar, phone, address),
        lines:invoice_lines(*),
        creator:users!invoices_created_by_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createInvoice(invoiceData: Partial<Invoice>, lines: Partial<InvoiceLine>[]) {
    // Generate invoice number
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .like('invoice_number', `INV-${year}-%`);

    const invoiceNumber = `INV-${year}-${String((count || 0) + 1).padStart(5, '0')}`;

    // Calculate totals
    let subtotal = 0;
    lines.forEach((line) => {
      subtotal += (line.quantity || 0) * (line.unit_price || 0) - (line.discount_amount || 0);
    });

    const discountAmount = invoiceData.discount_amount || 0;
    const taxPercentage = invoiceData.tax_percentage || 0;
    const taxAmount = ((subtotal - discountAmount) * taxPercentage) / 100;
    const totalAmount = subtotal - discountAmount + taxAmount;

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        ...invoiceData,
        invoice_number: invoiceNumber,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
      })
      .select()
      .single();

    if (invoiceError) {
      throw new Error(invoiceError.message);
    }

    // Create invoice lines
    const linesWithInvoiceId = lines.map((line, index) => ({
      ...line,
      invoice_id: invoice.id,
      line_number: index + 1,
      line_total: (line.quantity || 0) * (line.unit_price || 0) - (line.discount_amount || 0) + (line.tax_amount || 0),
    }));

    const { error: linesError } = await supabase
      .from('invoice_lines')
      .insert(linesWithInvoiceId);

    if (linesError) {
      throw new Error(linesError.message);
    }

    return invoice;
  },

  async updateInvoice(id: string, updates: Partial<Invoice>) {
    const { data, error } = await supabase
      .from('invoices')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateInvoiceStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        status,
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

  async recordPayment(id: string, amount: number) {
    const invoice = await this.getInvoiceById(id);
    const newPaidAmount = (invoice.paid_amount || 0) + amount;
    const newStatus = newPaidAmount >= invoice.total_amount ? 'paid' : 'partially_paid';

    const { data, error } = await supabase
      .from('invoices')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
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

  async deleteInvoice(id: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async getInvoiceStats() {
    const { data, error } = await supabase
      .from('invoices')
      .select('status, total_amount, paid_amount');

    if (error) {
      throw new Error(error.message);
    }

    const stats = {
      total: data.length,
      draft: data.filter((i) => i.status === 'draft').length,
      sent: data.filter((i) => i.status === 'sent').length,
      paid: data.filter((i) => i.status === 'paid').length,
      overdue: data.filter((i) => i.status === 'overdue').length,
      total_revenue: data.reduce((sum, i) => sum + (i.total_amount || 0), 0),
      total_collected: data.reduce((sum, i) => sum + (i.paid_amount || 0), 0),
    };

    return stats;
  },
};
