import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendance.service';
import { Layout } from '@/components/layout/Layout';
import { Download, Trash2, Edit } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { Attendance } from '@/types';

const BAGHDAD_TZ = 'Asia/Baghdad';

export const AttendancePage = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();
  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');

  const { data: records, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => attendanceService.getAttendance(),
  });

  const deleteMutation = useMutation({
    mutationFn: attendanceService.deleteAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Attendance> }) =>
      attendanceService.updateAttendance(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setEditingRecord(null);
    },
  });

  const exportMutation = useMutation({
    mutationFn: attendanceService.exportToExcel,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${Date.now()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (record: Attendance) => {
    setEditingRecord(record);
    setEditCheckIn(new Date(record.check_in).toISOString().slice(0, 16));
    setEditCheckOut(record.check_out ? new Date(record.check_out).toISOString().slice(0, 16) : '');
  };

  const handleSaveEdit = () => {
    if (editingRecord) {
      updateMutation.mutate({
        id: editingRecord.id,
        updates: {
          check_in: new Date(editCheckIn).toISOString(),
          check_out: editCheckOut ? new Date(editCheckOut).toISOString() : undefined,
        },
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إدارة الحضور</h2>
            <p className="text-gray-600 mt-1">عرض وإدارة سجلات الحضور لجميع الموظفين</p>
          </div>
          <button
            onClick={() => exportMutation.mutate(undefined)}
            disabled={exportMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            تصدير Excel
          </button>
        </div>

        {/* Attendance Records */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : records && records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الموظف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      تسجيل الدخول
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      تسجيل الخروج
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      ساعات العمل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      ملاحظات
                    </th>
                    {(hasPermission('attendance:edit') || hasPermission('attendance:delete')) && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        إجراءات
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((record: any) => {
                    const checkIn = new Date(record.check_in);
                    const checkOut = record.check_out ? new Date(record.check_out) : null;
                    let hours = '';
                    if (checkOut) {
                      const diff = checkOut.getTime() - checkIn.getTime();
                      const h = Math.floor(diff / (1000 * 60 * 60));
                      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                      hours = `${h}:${m.toString().padStart(2, '0')}`;
                    }

                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {record.user?.full_name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatInTimeZone(checkIn, BAGHDAD_TZ, 'yyyy-MM-dd HH:mm:ss')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {checkOut
                            ? formatInTimeZone(checkOut, BAGHDAD_TZ, 'yyyy-MM-dd HH:mm:ss')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{hours || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {record.notes || '-'}
                        </td>
                        {(hasPermission('attendance:edit') || hasPermission('attendance:delete')) && (
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {hasPermission('attendance:edit') && (
                                <button
                                  onClick={() => handleEdit(record)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="تعديل"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              {hasPermission('attendance:delete') && (
                                <button
                                  onClick={() => handleDelete(record.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="حذف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">لا توجد سجلات</div>
          )}
        </div>

        {/* Edit Modal */}
        {editingRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">تعديل سجل الحضور</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وقت الحضور
                  </label>
                  <input
                    type="datetime-local"
                    value={editCheckIn}
                    onChange={(e) => setEditCheckIn(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وقت الانصراف
                  </label>
                  <input
                    type="datetime-local"
                    value={editCheckOut}
                    onChange={(e) => setEditCheckOut(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
