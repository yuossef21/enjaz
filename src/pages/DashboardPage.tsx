import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Layout } from '@/components/layout/Layout';
import { FileText, CheckCircle, XCircle, Clock, Users, DollarSign, TrendingUp, Package } from 'lucide-react';

export const DashboardPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
  });

  const statCards = [
    {
      title: 'إجمالي الطلبات',
      value: stats?.leads?.total || 0,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'قيد الانتظار',
      value: stats?.leads?.pending || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'فرص',
      value: stats?.leads?.opportunity || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'مرفوض',
      value: stats?.leads?.rejected || 0,
      icon: XCircle,
      color: 'bg-red-500',
    },
  ];

  const businessCards = [
    {
      title: 'إجمالي العملاء',
      value: stats?.customers?.total || 0,
      subtitle: `${stats?.customers?.thisMonth || 0} هذا الشهر`,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'إجمالي الفواتير',
      value: stats?.invoices?.total || 0,
      subtitle: `${stats?.invoices?.paid || 0} مدفوعة`,
      icon: Package,
      color: 'bg-indigo-500',
    },
    {
      title: 'المبالغ المحصلة',
      value: `${(stats?.invoices?.paidAmount || 0).toLocaleString('ar-IQ')} د.ع`,
      subtitle: `من ${(stats?.invoices?.totalAmount || 0).toLocaleString('ar-IQ')} د.ع`,
      icon: DollarSign,
      color: 'bg-green-600',
    },
    {
      title: 'فواتير السائقين',
      value: stats?.drivers?.totalInvoices || 0,
      subtitle: `${(stats?.drivers?.pendingAmount || 0).toLocaleString('ar-IQ')} د.ع معلقة`,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">لوحة التحكم</h2>
          <p className="text-gray-600 mt-1">نظرة عامة على النظام</p>
        </div>

        {/* Lead Stats Cards */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">إحصائيات الطلبات</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <div
                key={stat.title}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {isLoading ? '...' : stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Stats Cards */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">إحصائيات الأعمال</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessCards.map((stat) => (
              <div
                key={stat.title}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {isLoading ? '...' : stat.value}
                </p>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">أحدث الطلبات</h3>
            {isLoading ? (
              <p className="text-gray-500 text-center py-4">جاري التحميل...</p>
            ) : stats?.recentLeads?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentLeads.map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{lead.customer_name}</p>
                      <p className="text-xs text-gray-500">{lead.promoter?.full_name || '-'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      lead.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'opportunity' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {lead.status === 'pending' ? 'قيد الانتظار' :
                       lead.status === 'opportunity' ? 'فرصة' : 'مرفوض'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">لا توجد طلبات</p>
            )}
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">أحدث الفواتير</h3>
            {isLoading ? (
              <p className="text-gray-500 text-center py-4">جاري التحميل...</p>
            ) : stats?.recentInvoices?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentInvoices.map((invoice: any) => (
                  <div key={invoice.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                      <p className="text-xs text-gray-500">{invoice.customer?.customer_name || '-'}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{Number(invoice.total_amount).toLocaleString('ar-IQ')} د.ع</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status === 'paid' ? 'مدفوعة' :
                         invoice.status === 'partial' ? 'جزئية' : 'معلقة'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">لا توجد فواتير</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
