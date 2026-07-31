import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Store, ShoppingBag, TrendingUp, Clock, AlertCircle, LayoutDashboard, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminAPI } from '../../api/orders';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/LoadingSpinner';

const NAV = [
  ['/admin', LayoutDashboard, 'Dashboard'],
  ['/admin/users', Users, 'Users'],
  ['/admin/restaurants', Store, 'Restaurants'],
  ['/admin/orders', ShoppingBag, 'Orders'],
];

function AdminSidebar({ active }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  return (
    <aside className="w-64 bg-white dark:bg-dark-800 border-r border-gray-100 dark:border-dark-700 flex flex-col">
      <div className="p-5 border-b border-gray-100 dark:border-dark-700">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center"><span className="text-white text-sm">🍔</span></div>
          <span className="font-display font-bold text-lg text-gradient">FoodRush</span>
        </Link>
        <span className="text-xs text-red-500 font-semibold mt-1 block">Admin Panel</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(([path, Icon, label]) => (
          <Link key={path} to={path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active === path ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'}`}>
            <Icon size={18} /> {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100 dark:border-dark-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
          <div><p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p><p className="text-xs text-red-500">Administrator</p></div>
        </div>
        <button onClick={async () => { await logout(); navigate('/login'); }} className="flex items-center gap-2 text-sm text-red-500 w-full px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}

export { AdminSidebar };

function StatCard({ icon: Icon, label, value, color, change }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}><Icon size={22} className="text-white" /></div>
        {change && <span className="text-xs font-semibold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">{change}</span>}
      </div>
      <p className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-900">
      <AdminSidebar active="/admin" />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="section-title mb-2">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Platform overview</p>

        {loading ? <LoadingSpinner /> : !stats ? <p>Failed to load</p> : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Users} label="Total Users" value={stats.totalUsers?.toLocaleString()} color="bg-blue-500" />
              <StatCard icon={Store} label="Restaurants" value={stats.totalRestaurants} color="bg-purple-500" />
              <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders?.toLocaleString()} color="bg-brand-500" />
              <StatCard icon={TrendingUp} label="Revenue" value={`₹${((stats.totalRevenue || 0) / 1000).toFixed(1)}k`} color="bg-green-500" />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={18} className="text-orange-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Pending Approvals</h3>
                </div>
                <p className="font-display text-4xl font-bold text-orange-500 mb-1">{stats.pendingApprovals}</p>
                <p className="text-sm text-gray-500">Restaurants awaiting approval</p>
                <Link to="/admin/restaurants?isApproved=false" className="btn-outline py-2 px-4 text-sm mt-3 inline-flex">Review Now</Link>
              </div>
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={18} className="text-brand-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Active Orders</h3>
                </div>
                <p className="font-display text-4xl font-bold text-brand-500 mb-1">{stats.activeOrders}</p>
                <p className="text-sm text-gray-500">Orders currently in progress</p>
                <Link to="/admin/orders" className="btn-outline py-2 px-4 text-sm mt-3 inline-flex">View Orders</Link>
              </div>
            </div>

            {/* Weekly revenue chart (simple bars) */}
            {stats.weeklyRevenue?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Revenue</h3>
                <div className="flex items-end gap-2 h-32">
                  {stats.weeklyRevenue.map((day) => {
                    const max = Math.max(...stats.weeklyRevenue.map(d => d.revenue));
                    const height = max > 0 ? (day.revenue / max) * 100 : 0;
                    return (
                      <div key={day._id} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-brand-500 rounded-t-lg transition-all" style={{ height: `${height}%` }} title={`₹${day.revenue}`} />
                        <span className="text-xs text-gray-400">{day._id?.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
