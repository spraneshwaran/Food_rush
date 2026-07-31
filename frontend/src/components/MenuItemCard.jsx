import { useState } from 'react';
import { Plus, Minus, Star, Flame, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function MenuItemCard({ item, restaurantId, restaurantName }) {
  const [showConflict, setShowConflict] = useState(false);
  const { addItem, updateQuantity, removeItem, items } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const cartItem = items.find((i) => i._id === item._id);
  const quantity = cartItem?.quantity || 0;

  const effectivePrice = item.discountedPrice || item.price;
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;

  const handleAdd = () => {
    if (!isAuthenticated()) {
      toast.error('Please login to add items');
      navigate('/login');
      return;
    }
    const result = addItem(item, restaurantId, restaurantName);
    if (result?.conflict) {
      setShowConflict(true);
    } else {
      toast.success(`${item.name} added to cart`, { icon: '🛒' });
    }
  };

  const handleClearAndAdd = () => {
    useCartStore.getState().clearCart();
    addItem(item, restaurantId, restaurantName);
    setShowConflict(false);
    toast.success('Cart updated', { icon: '🛒' });
  };

  return (
    <>
      <div className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors group">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Veg/Non-veg indicator */}
            <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center shrink-0 ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
            </div>
            {item.isBestseller && (
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star size={10} className="fill-amber-500 text-amber-500" /> Bestseller
              </span>
            )}
            {item.spiceLevel === 'hot' || item.spiceLevel === 'extra-hot' ? (
              <Flame size={14} className="text-red-500" />
            ) : null}
          </div>

          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{item.name}</h4>
          {item.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{item.description}</p>
          )}

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-white">₹{effectivePrice}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
            )}
            {hasDiscount && (
              <span className="text-xs text-green-600 font-semibold">
                {Math.round((1 - effectivePrice / item.price) * 100)}% off
              </span>
            )}
          </div>
        </div>

        {/* Image + Add button */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-dark-600 dark:to-dark-700 overflow-hidden">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">🍽</div>
            )}
          </div>

          {/* Add / Quantity controller */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <AnimatePresence mode="wait">
              {quantity === 0 ? (
                <motion.button
                  key="add"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={handleAdd}
                  className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-brand transition-colors whitespace-nowrap"
                >
                  ADD
                </motion.button>
              ) : (
                <motion.div
                  key="qty"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-2 bg-brand-500 rounded-full px-2 py-1 shadow-brand"
                >
                  <button
                    onClick={() => quantity === 1 ? removeItem(item._id) : updateQuantity(item._id, quantity - 1)}
                    className="w-5 h-5 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <Minus size={11} className="text-white" />
                  </button>
                  <span className="text-white text-xs font-bold min-w-[12px] text-center">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, quantity + 1)}
                    className="w-5 h-5 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <Plus size={11} className="text-white" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Restaurant conflict dialog */}
      {showConflict && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card p-6 max-w-sm w-full"
          >
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-2">Start a new cart?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Your cart has items from another restaurant. Would you like to clear it and start fresh?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConflict(false)} className="btn-secondary flex-1">Keep existing</button>
              <button onClick={handleClearAndAdd} className="btn-primary flex-1">Start new cart</button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
