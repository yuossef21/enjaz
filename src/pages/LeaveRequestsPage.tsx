import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveRequestsService } from '@/services/leave-requests.service';
import { employeesService } from '@/services/employees.service';
import { Layout } from '@/components/layout/Layout';
import { Plus, Check, X, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const LeaveRequestsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['leave-requests', statusFilter],
    queryFn: () => leaveRequestsService.getLeaveRequests({ status: statusFilter }),
  });

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesService.getEmployees({ status: 'active' }),
  });

  const approveMutation = useMutation({
    mutationFn: leaveRequestsService.approveLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      leaveRequestsService.rejectLeaveRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: leaveRequestsService.deleteLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
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

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'قيد الانتظار',
      approved: 'موافق عليه',
      rejected: 'مرفوض',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getLeaveTypeLabel = (type: string) => {
    const labels = {
      annual: 'إجازة سنوية',
      sick: 'إجازة مرضية',
      unpaid: 'إجازة بدون راتب',
      emergency: 'إجازة طارئة',
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إدارة الإجازات</h2>
            <p className="text-gray-600 mt-1">عرض وإدارة طلبات الإجازات</p>
          </div>
          {hasPermission('leave:create') && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              طلب إجازة جديد
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
            <option value="pending">قيد الانتظار</option>
            <option value="approved">موافق عليه</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : requests && requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الموظف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      نوع الإجازة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      من تاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      إلى تاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      عدد الأيام
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
                  {requests.map((request: any) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {request.employee?.full_name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getLeaveTypeLabel(request.leave_type)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(request.start_date).toLocaleDateString('ar-IQ')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(request.end_date).toLocaleDateString('ar-IQ')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {request.days_count}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {hasPermission('leave:approve') && request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(request.id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="موافقة"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="رفض"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {hasPermission('leave:delete') && request.status === 'pending' && (
                            <button
                              onClick={() => handleDelete(request.id)}
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
            <div className="p-8 text-center text-gray-500">لا توجد طلبات إجازات</div>
          )}
        </div>

        {showForm && (
          <LeaveRequestForm
            employees={employees || []}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
              setShowForm(false);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

const LeaveRequestForm = ({
  employees,
  onClose,
  onSuccess,
}: {
  employees: any[];
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    days_count: 0,
    reason: '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => leaveRequestsService.createLeaveRequest(data),
    onSuccess,
  });

  const calculateDays = (start: string, end: string) => {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData({ ...formData, start_date: start, end_date: end, days_count: diffDays });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">طلب إجازة جديد</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الموظف *
            </label>
            <select
              required
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر الموظف</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} - {emp.employee_code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الإجازة *
            </label>
            <select
              required
              value={formData.leave_type}
              onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="annual">إجازة سنوية</option>
              <option value="sick">إجازة مرضية</option>
              <option value="unpaid">إجازة بدون راتب</option>
              <option value="emergency">إجازة طارئة</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                من تاريخ *
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => calculateDays(e.target.value, formData.end_date)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                إلى تاريخ *
              </label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => calculateDays(formData.start_date, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد الأيام
              </label>
              <input
                type="number"
                readOnly
                value={formData.days_count}
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              السبب
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
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
