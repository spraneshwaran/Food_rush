import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Phone, MapPin, ChefHat, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { ordersAPI } from '../../api/orders';
import OrderTracker from '../../components/OrderTracker';
import LoadingSpinner from '../../components/LoadingSpinner';
import useOrderStore from '../../store/orderStore';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { activeOrder, startTracking } = useOrderStore();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await ordersAPI.getById(id);
        const fetchedOrder = data.data;
        setOrder(fetchedOrder);
        // Start simulation if order is not delivered/cancelled
        if (!['delivered', 'cancelled'].includes(fetchedOrder.status)) {
          startTracking(fetchedOrder);
        }
      } catch { } finally { setLoading(false); }
    };
    fetchOrder();
  }, [id]);

  const displayOrder = (activeOrder?._id === id) ? { ...order, status: activeOrder.status } : order;

  if (loading) return <LoadingSpinner text="Loading order..." />;
  if (!displayOrder) return <div className="text-center py-20 text-gray-500">Order not found</div>;

  return (
    <main className="min-h-screen py-8 page-container">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/orders" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
            <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
          </Link>
          <div>
            <h1 className="section-title">Track Order</h1>
            <p className="text-xs text-gray-400 mt-0.5">#{displayOrder._id?.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div className="card p-6 mb-4">
          <OrderTracker
            status={displayOrder.status}
            statusHistory={displayOrder.statusHistory}
            orderCreatedAt={displayOrder.createdAt}
            estimatedTime={displayOrder.estimatedDeliveryTime}
          />
        </div>

        {/* Delivery person */}
        {displayOrder.deliveryPerson && displayOrder.status === 'out_for_delivery' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center text-2xl">🛵</div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{displayOrder.deliveryPerson.name}</p>
                  <p className="text-xs text-gray-500">{displayOrder.deliveryPerson.vehicleNumber}</p>
                </div>
              </div>
              <a href={`tel:${displayOrder.deliveryPerson.phone}`} className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors">
                <Phone size={14} /> Call
              </a>
            </div>
          </motion.div>
        )}

        {/* Order details */}
        <div className="card p-5 mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <ChefHat size={16} className="text-brand-500" />
            {displayOrder.restaurant?.name}
          </h3>
          <div className="space-y-2">
            {displayOrder.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{item.name} × {item.quantity}</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-dark-600 mt-3 pt-3 flex justify-between font-bold text-gray-900 dark:text-white">
            <span>Total Paid</span>
            <span>₹{displayOrder.pricing?.total?.toFixed(0)}</span>
          </div>
        </div>

        {/* Delivery address */}
        <div className="card p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            <MapPin size={14} className="text-brand-500" /> Delivery Address
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {displayOrder.deliveryAddress?.street}, {displayOrder.deliveryAddress?.city}
          </p>
        </div>
      </div>
    </main>
  );
}
