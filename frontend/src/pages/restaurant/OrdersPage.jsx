import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Menu, ListOrdered, LogOut } from 'lucide-react';
import { ordersAPI } from '../../api/orders';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-blue-100 text-blue-700', confirmed: 'bg-purple-100 text-purple-700',
  preparing: 'bg-orange-100 text-orange-700', out_for_delivery: 'bg-yellow-100 text-yellow-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
};

const NEXT_STATUS = {
  pending: 'confirmed', confirmed: 'preparing',
  preparing: 'out_for_delivery', out_for_delivery: 'delivered',
};

const NEXT_LABEL = {
  pending: 'Confirm', confirmed: 'Start Preparing',
  preparing: 'Out for Delivery', out_for_delivery: 'Mark Delivered',
};

export default function RestaurantOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { limit: 30 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await ordersAPI.getRestaurantOrders(params);
      setOrders(data.data || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, { status });
      setOrders(o => o.map(ord => ord._id === orderId ? { ...ord, status } : ord));
      toast.success(`Order ${status}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-900">
      <aside className="w-64 bg-white dark:bg-dark-800 border-r border-gray-100 dark:border-dark-700 flex flex-col">
        <div className="p-5 border-b border-gray-100 dark:border-dark-700">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center"><span className="text-white text-sm">🍔</span></div>
            <span className="font-display font-bold text-lg text-gradient">FoodRush</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[['/dashboard', LayoutDashboard, 'Dashboard'], ['/dashboard/menu', Menu, 'Menu Items'], ['/dashboard/orders', ListOrdered, 'Orders']].map(([path, Icon, label]) => (
            <Link key={path} to={path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${path === '/dashboard/orders' ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'}`}>
              <Icon size={18} />{label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-dark-700">
          <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-2 text-sm text-red-500 w-full px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title">Orders</h1>
          <div className="flex gap-2 flex-wrap">
            {['', 'pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? <LoadingSpinner /> : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">📦</p><p>No orders found</p>
          </div>
        ) : (
          <div className="card divide-y divide-gray-100 dark:divide-dark-700">
            {orders.map(order => (
              <div key={order._id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {order.user?.name} <span className="text-gray-400 font-normal text-xs">· #{order._id.slice(-8)}</span>
                    </p>
                    <span className={`badge ${STATUS_COLORS[order.status] || ''}`}>{order.status?.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{order.items?.map(i => `${i.name} ×${i.quantity}`).join(' • ')}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{order.user?.phone}</span>
                    <span>₹{order.pricing?.total?.toFixed(0)} · {order.payment?.method?.toUpperCase()}</span>
                    <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {NEXT_STATUS[order.status] && (
                    <button onClick={() => handleStatusUpdate(order._id, NEXT_STATUS[order.status])} className="btn-primary py-2 px-4 text-sm">
                      {NEXT_LABEL[order.status]}
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button onClick={() => handleStatusUpdate(order._id, 'cancelled')} className="btn-secondary py-2 px-4 text-sm text-red-500">
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
