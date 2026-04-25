import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseClaimsService } from '@/services/expense-claims.service';
import { Layout } from '@/components/layout/Layout';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const ExpenseClaimsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();

  const { data: claims, isLoading } = useQuery({
    queryKey: ['expense-claims', statusFilter],
    queryFn: () => expenseClaimsService.getExpenseClaims({ status: statusFilter }),
  });

  const approveMutation = useMutation({
    mutationFn: expenseClaimsService.approveExpenseClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-claims'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      expenseClaimsService.rejectExpenseClaim(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-claims'] });
    },
  });

  const handleApprove = (id: string) => {
    if (confirm('هل أنت متأكد من الموافقة على هذا الطلب؟')) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt('سبب الرفض:');
    if (reason) {
      rejectMutation.mutate({ id, reason });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-purple-100 text-purple-800',
    };
    const labels = {
      draft: 'مسودة',
      submitted: 'مقدم',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
      paid: 'مدفوع',
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
            <h2 className="text-2xl font-bold text-gray-900">إدارة المصروفات</h2>
            <p className="text-gray-600 mt-1">عرض وإدارة طلبات المصروفات</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            طلب مصروف جديد
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الحالات</option>
            <option value="draft">مسودة</option>
            <option value="submitted">مقدم</option>
            <option value="approved">موافق عليه</option>
            <option value="rejected">مرفوض</option>
            <option value="paid">مدفوع</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : claims && claims.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      رقم الطلب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الموظف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المبلغ الإجمالي
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
                  {claims.map((claim: any) => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {claim.claim_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {claim.employee?.full_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(claim.claim_date).toLocaleDateString('ar-IQ')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {claim.total_amount?.toLocaleString('ar-IQ')} IQD
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(claim.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {hasPermission('expenses:approve') && claim.status === 'submitted' && (
                            <>
                              <button
                                onClick={() => handleApprove(claim.id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="موافقة"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(claim.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="رفض"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">لا توجد طلبات مصروفات</div>
          )}
        </div>

        {showForm && (
          <ExpenseClaimForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['expense-claims'] });
              setShowForm(false);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

const ExpenseClaimForm = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    claim_date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [items, setItems] = useState<Array<{ category: string; description: string; amount: number }>>([
    { category: '', description: '', amount: 0 },
  ]);

  const mutation = useMutation({
    mutationFn: (data: any) => expenseClaimsService.createExpenseClaim(data, items),
    onSuccess,
  });

  const addItem = () => {
    setItems([...items, { category: '', description: '', amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">طلب مصروف جديد</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الطلب *
              </label>
              <input
                type="date"
                required
                value={formData.claim_date}
                onChange={(e) => setFormData({ ...formData, claim_date: e.target.value })}
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

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-900">بنود المصروف</h4>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                + إضافة بند
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded">
                <div className="col-span-3">
                  <input
                    type="text"
                    placeholder="الفئة"
                    value={item.category}
                    onChange={(e) => updateItem(index, 'category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="col-span-5">
                  <input
                    type="text"
                    placeholder="الوصف"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    placeholder="المبلغ"
                    value={item.amount}
                    onChange={(e) => updateItem(index, 'amount', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="w-full px-2 py-2 text-red-600 hover:bg-red-50 rounded text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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
