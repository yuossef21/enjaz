import { supabase } from '../config/database.js';
import { ExpenseClaim, ExpenseClaimItem } from '../models/accounting-types.js';

export const expenseClaimsService = {
  async getExpenseClaims(filters?: {
    employee_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }) {
    let query = supabase
      .from('expense_claims')
      .select(`
        *,
        employee:users!expense_claims_employee_id_fkey(id, full_name, email),
        approver:users!expense_claims_approved_by_fkey(id, full_name, email),
        items:expense_claim_items(*)
      `)
      .order('claim_date', { ascending: false });

    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.start_date) {
      query = query.gte('claim_date', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('claim_date', filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getExpenseClaimById(id: string) {
    const { data, error } = await supabase
      .from('expense_claims')
      .select(`
        *,
        employee:users!expense_claims_employee_id_fkey(id, full_name, email),
        approver:users!expense_claims_approved_by_fkey(id, full_name, email),
        items:expense_claim_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createExpenseClaim(
    claimData: Partial<ExpenseClaim>,
    items: Partial<ExpenseClaimItem>[]
  ) {
    // Generate claim number
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('expense_claims')
      .select('*', { count: 'exact', head: true })
      .like('claim_number', `EXP-${year}-%`);

    const claimNumber = `EXP-${year}-${String((count || 0) + 1).padStart(5, '0')}`;

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

    // Create claim
    const { data: claim, error: claimError } = await supabase
      .from('expense_claims')
      .insert({
        ...claimData,
        claim_number: claimNumber,
        total_amount: totalAmount,
      })
      .select()
      .single();

    if (claimError) {
      throw new Error(claimError.message);
    }

    // Create items
    const itemsWithClaimId = items.map((item) => ({
      ...item,
      expense_claim_id: claim.id,
    }));

    const { error: itemsError } = await supabase
      .from('expense_claim_items')
      .insert(itemsWithClaimId);

    if (itemsError) {
      throw new Error(itemsError.message);
    }

    return claim;
  },

  async submitExpenseClaim(id: string) {
    const { data, error } = await supabase
      .from('expense_claims')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async approveExpenseClaim(id: string, approvedBy: string) {
    const { data, error } = await supabase
      .from('expense_claims')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async rejectExpenseClaim(id: string, rejectionReason: string) {
    const { data, error } = await supabase
      .from('expense_claims')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async markAsPaid(id: string) {
    const { data, error } = await supabase
      .from('expense_claims')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async deleteExpenseClaim(id: string) {
    const { error } = await supabase
      .from('expense_claims')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },
};
