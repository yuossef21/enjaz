export interface Product {
  id: string;
  product_code: string;
  name_ar: string;
  name_en?: string;
  description?: string;
  category?: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  min_stock_level: number;
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  warehouse_code: string;
  name_ar: string;
  name_en?: string;
  location?: string;
  manager_name?: string;
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment';
  product_id: string;
  warehouse_id: string;
  quantity: number;
  reference_number?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  supplier_code: string;
  name_ar: string;
  name_en?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: 'active' | 'inactive';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  order_date: string;
  expected_delivery_date?: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
