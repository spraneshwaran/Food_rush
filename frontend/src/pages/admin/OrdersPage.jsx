import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/orders';
import { AdminSidebar } from './AdminDashboard';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_COLORS = {
  pending: 'bg-blue-100 text-blue-700', confirmed: 'bg-purple-100 text-purple-700',
  preparing: 'bg-orange-100 text-orange-700', out_for_delivery: 'bg-yellow-100 text-yellow-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    adminAPI.getOrders(params)
      .then(({ data }) => setOrders(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-900">
      <AdminSidebar active="/admin/orders" />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title">All Orders</h1>
          <div className="flex gap-2 flex-wrap">
            {['', 'pending', 'preparing', 'delivered', 'cancelled'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>
        {loading ? <LoadingSpinner /> : (
          <div className="card divide-y divide-gray-100 dark:divide-dark-700">
            {orders.length === 0 ? <div className="text-center py-12 text-gray-500">No orders found</div> : (
              orders.map(order => (
                <div key={order._id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">{order.restaurant?.name}</span>
                      <span className={`badge ${STATUS_COLORS[order.status] || ''}`}>{order.status?.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {order.user?.name} · {order.user?.email} · {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900 dark:text-white">₹{order.pricing?.total?.toFixed(0)}</p>
                    <p className="text-xs text-gray-400">{order.payment?.method?.toUpperCase()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
