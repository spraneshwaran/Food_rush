import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../../store/cartStore';

export default function CartPage() {
  const { items, restaurantName, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();
  const navigate = useNavigate();
  const subtotal = getSubtotal();
  const deliveryFee = subtotal > 0 ? 30 : 0;
  const tax = parseFloat((subtotal * 0.05).toFixed(2));
  const total = subtotal + deliveryFee + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add items from a restaurant to get started</p>
          <Link to="/restaurants" className="btn-primary">
            <ShoppingBag size={18} /> Browse Restaurants
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-8 page-container">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
          <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="section-title">Your Cart</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-600">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{restaurantName}</p>
                <p className="text-xs text-gray-500">{items.length} items</p>
              </div>
              <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium">
                <Trash2 size={13} /> Clear all
              </button>
            </div>

            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-dark-600 last:border-0"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-dark-700 dark:to-dark-600 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : '🍽'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.name}</p>
                    <p className="text-sm text-brand-500 font-bold">₹{(item.discountedPrice || item.price) * item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-full px-2 py-1">
                    <button
                      onClick={() => item.quantity === 1 ? removeItem(item._id) : updateQuantity(item._id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-bold text-sm text-gray-900 dark:text-white min-w-[20px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Coupon */}
          <div className="card p-4 mt-4 flex items-center gap-3">
            <Tag size={18} className="text-brand-500" />
            <input type="text" placeholder="Enter coupon code" className="flex-1 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-300" />
            <button className="text-sm font-semibold text-brand-500 hover:text-brand-600">Apply</button>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="card p-5 sticky top-20">
            <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-4">Bill Details</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Item total</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{tax.toFixed(0)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-dark-600 pt-3 flex justify-between font-bold text-gray-900 dark:text-white text-base">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full mt-5"
            >
              Proceed to Checkout →
            </button>
            <Link to="/restaurants" className="block text-center text-sm text-brand-500 hover:text-brand-600 mt-3">
              + Add more items
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
