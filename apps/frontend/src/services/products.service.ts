import api from './api';
import { Product } from '@/types';

export const productsService = {
  async getProducts(params?: {
    category?: string;
    status?: string;
  }): Promise<Product[]> {
    const { data } = await api.get<Product[]>('/products', { params });
    return data;
  },

  async getProductById(id: string): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const { data } = await api.post<Product>('/products', productData);
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data } = await api.patch<Product>(`/products/${id}`, updates);
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
