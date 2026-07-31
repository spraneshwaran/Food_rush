import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingBag, Star, Clock, UtensilsCrossed, LayoutDashboard, Menu, ListOrdered, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { restaurantsAPI } from '../../api/restaurants';
import { ordersAPI } from '../../api/orders';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
      <p className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {sub && <p className="text-xs text-brand-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

const STATUS_COLORS = {
  pending: 'bg-blue-100 text-blue-700', confirmed: 'bg-purple-100 text-purple-700',
  preparing: 'bg-orange-100 text-orange-700', out_for_delivery: 'bg-yellow-100 text-yellow-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
};

export default function RestaurantDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restRes, ordersRes] = await Promise.all([
          restaurantsAPI.getMyRestaurant(),
          ordersAPI.getRestaurantOrders({ limit: 10, status: 'pending' }),
        ]);
        const rest = restRes.data.data;
        setRestaurant(rest);

        const analyticsRes = await restaurantsAPI.getAnalytics(rest._id);
        setStats(analyticsRes.data.data);
        setOrders(ordersRes.data.data || []);
      } catch { } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, { status });
      setOrders(o => o.map(ord => ord._id === orderId ? { ...ord, status } : ord));
      toast.success('Order status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-dark-800 border-r border-gray-100 dark:border-dark-700 flex flex-col">
        <div className="p-5 border-b border-gray-100 dark:border-dark-700">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🍔</span>
            </div>
            <span className="font-display font-bold text-lg text-gradient">FoodRush</span>
          </Link>
          <p className="text-xs text-gray-400 mt-2">Restaurant Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            ['/dashboard', LayoutDashboard, 'Dashboard'],
            ['/dashboard/menu', Menu, 'Menu Items'],
            ['/dashboard/orders', ListOrdered, 'Orders'],
          ].map(([path, Icon, label]) => (
            <Link key={path} to={path} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-dark-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 w-full px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="section-title">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{restaurant?.name}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={ShoppingBag} label="Total Orders" value={stats?.totalOrders || 0} color="bg-brand-gradient bg-brand-500" />
          <StatCard icon={TrendingUp} label="Total Revenue" value={`₹${((stats?.totalRevenue || 0) / 1000).toFixed(1)}k`} color="bg-green-500" />
          <StatCard icon={Clock} label="Pending Orders" value={stats?.pendingOrders || 0} color="bg-orange-500" />
          <StatCard icon={Star} label="Rating" value={restaurant?.rating?.average?.toFixed(1) || '—'} color="bg-purple-500" sub={`${restaurant?.rating?.count || 0} reviews`} />
        </div>

        {/* Recent orders */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-dark-700">
            <h2 className="font-display font-bold text-gray-900 dark:text-white">Pending Orders</h2>
            <Link to="/dashboard/orders" className="text-sm text-brand-500 hover:text-brand-600 font-medium">View all</Link>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UtensilsCrossed size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No pending orders</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-dark-700">
              {orders.map(order => (
                <div key={order._id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {order.user?.name} <span className="text-gray-400 font-normal">· #{order._id.slice(-6)}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                    <p className="text-sm font-bold text-brand-500 mt-1">₹{order.pricing?.total?.toFixed(0)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`badge ${STATUS_COLORS[order.status] || ''} dark:bg-opacity-30`}>
                      {order.status}
                    </span>
                    {order.status === 'pending' && (
                      <button onClick={() => handleStatusUpdate(order._id, 'confirmed')} className="btn-primary py-1.5 px-3 text-xs">
                        Confirm
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button onClick={() => handleStatusUpdate(order._id, 'preparing')} className="btn-primary py-1.5 px-3 text-xs">
                        Preparing
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
