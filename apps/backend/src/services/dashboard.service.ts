import { supabase } from '../config/database.js';

export const dashboardService = {
  async getComprehensiveStats(userId?: string, role?: string) {
    // Lead stats
    let leadsQuery = supabase.from('leads').select('status, created_at');
    if (role === 'promoter' && userId) {
      leadsQuery = leadsQuery.eq('promoter_id', userId);
    }
    const { data: leads } = await leadsQuery;

    const leadStats = {
      total: leads?.length || 0,
      pending: leads?.filter((l) => l.status === 'pending').length || 0,
      opportunity: leads?.filter((l) => l.status === 'opportunity').length || 0,
      rejected: leads?.filter((l) => l.status === 'rejected').length || 0,
    };

    // Customer stats
    const { data: customers } = await supabase
      .from('customers')
      .select('id, created_at');

    const customerStats = {
      total: customers?.length || 0,
      thisMonth: customers?.filter((c) => {
        const created = new Date(c.created_at);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length || 0,
    };

    // Invoice stats
    const { data: invoices } = await supabase
      .from('invoices')
      .select('status, total_amount, paid_amount, driver_id, invoice_date');

    const invoiceStats = {
      total: invoices?.length || 0,
      pending: invoices?.filter((i) => i.status === 'pending').length || 0,
      paid: invoices?.filter((i) => i.status === 'paid').length || 0,
      partial: invoices?.filter((i) => i.status === 'partial').length || 0,
      totalAmount: invoices?.reduce((sum, i) => sum + Number(i.total_amount), 0) || 0,
      paidAmount: invoices?.reduce((sum, i) => sum + Number(i.paid_amount), 0) || 0,
      pendingAmount: invoices?.reduce((sum, i) => sum + (Number(i.total_amount) - Number(i.paid_amount)), 0) || 0,
    };

    // Driver invoices (invoices assigned to drivers)
    const driverInvoices = invoices?.filter((i) => i.driver_id) || [];
    const driverStats = {
      totalInvoices: driverInvoices.length,
      totalAmount: driverInvoices.reduce((sum, i) => sum + Number(i.total_amount), 0),
      pendingAmount: driverInvoices.reduce((sum, i) => sum + (Number(i.total_amount) - Number(i.paid_amount)), 0),
    };

    // Recent activity
    const { data: recentLeads } = await supabase
      .from('leads')
      .select(`
        id,
        customer_name,
        status,
        created_at,
        promoter:users!leads_promoter_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentInvoices } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        total_amount,
        status,
        invoice_date,
        customer:customers(customer_name)
      `)
      .order('invoice_date', { ascending: false })
      .limit(5);

    return {
      leads: leadStats,
      customers: customerStats,
      invoices: invoiceStats,
      drivers: driverStats,
      recentLeads: recentLeads || [],
      recentInvoices: recentInvoices || [],
    };
  },
};
