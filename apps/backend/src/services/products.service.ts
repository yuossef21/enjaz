import { supabase } from '../config/database.js';
import { Product } from '../models/inventory-types.js';

export const productsService = {
  async getProducts(filters?: {
    category?: string;
    status?: string;
  }) {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createProduct(productData: Partial<Product>) {
    // Generate product code
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .like('product_code', `PRD-${year}-%`);

    const productCode = `PRD-${year}-${String((count || 0) + 1).padStart(5, '0')}`;

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        product_code: productCode,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },
};
