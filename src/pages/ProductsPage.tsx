import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { Layout } from '@/components/layout/Layout';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Product } from '@/types';
import { useAuthStore } from '@/store/authStore';

export const ProductsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', statusFilter],
    queryFn: () => productsService.getProducts({ status: statusFilter }),
  });

  const deleteMutation = useMutation({
    mutationFn: productsService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      active: 'نشط',
      inactive: 'غير نشط',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h2>
            <p className="text-gray-600 mt-1">عرض وإدارة المنتجات والمخزون</p>
          </div>
          {hasPermission('products:create') && (
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              منتج جديد
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : products && products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      رمز المنتج
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      اسم المنتج
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الفئة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الوحدة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      سعر التكلفة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      سعر البيع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المخزون الحالي
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {product.product_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.name_ar}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.category || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.cost_price?.toLocaleString('ar-IQ')} IQD
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {product.selling_price?.toLocaleString('ar-IQ')} IQD
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={product.current_stock <= product.min_stock_level ? 'text-red-600 font-medium' : 'text-gray-900'}>
                            {product.current_stock}
                          </span>
                          {product.current_stock <= product.min_stock_level && (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(product.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {hasPermission('products:edit') && (
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="تعديل"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission('products:delete') && (
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">لا توجد منتجات</div>
          )}
        </div>

        {showForm && (
          <ProductForm
            product={editingProduct}
            onClose={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['products'] });
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

const ProductForm = ({
  product,
  onClose,
  onSuccess,
}: {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    name_ar: product?.name_ar || '',
    name_en: product?.name_en || '',
    description: product?.description || '',
    category: product?.category || '',
    unit: product?.unit || 'قطعة',
    cost_price: product?.cost_price || 0,
    selling_price: product?.selling_price || 0,
    current_stock: product?.current_stock || 0,
    min_stock_level: product?.min_stock_level || 0,
    status: product?.status || 'active',
    notes: product?.notes || '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      product
        ? productsService.updateProduct(product.id, data)
        : productsService.createProduct(data),
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {product ? 'تعديل المنتج' : 'منتج جديد'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المنتج (عربي) *
              </label>
              <input
                type="text"
                required
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المنتج (إنجليزي)
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوحدة *
              </label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر التكلفة *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر البيع *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المخزون الحالي *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحد الأدنى للمخزون *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.min_stock_level}
                onChange={(e) => setFormData({ ...formData, min_stock_level: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
