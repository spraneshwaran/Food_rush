import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { ordersAPI } from '../../api/orders';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUS_COLORS = {
  pending:          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  confirmed:        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  preparing:        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  out_for_delivery: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  delivered:        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  cancelled:        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABELS = {
  pending: 'Order Placed', confirmed: 'Confirmed', preparing: 'Preparing',
  out_for_delivery: 'On the way', delivered: 'Delivered', cancelled: 'Cancelled',
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getMyOrders({ limit: 20 })
      .then(({ data }) => setOrders(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading orders..." />;

  return (
    <main className="min-h-screen py-8 page-container">
      <h1 className="section-title mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-4">📦</div>
          <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't ordered anything yet!</p>
          <Link to="/restaurants" className="btn-primary">Start Ordering</Link>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/orders/${order._id}/track`}>
                <div className="card p-5 hover:-translate-y-0.5 transition-all group">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-orange-50 dark:from-dark-700 dark:to-dark-600 rounded-xl flex items-center justify-center text-xl overflow-hidden">
                        {order.restaurant?.image
                          ? <img src={order.restaurant.image} alt="" className="w-full h-full object-cover" />
                          : '🍽'
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{order.restaurant?.name}</p>
                        <p className="text-xs text-gray-400">#{order._id?.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                    <span className={`badge ${STATUS_COLORS[order.status] || ''}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-3">
                    {order.items?.map(i => i.name).join(', ')}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock size={13} />
                      <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
                      ₹{order.pricing?.total?.toFixed(0)}
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
