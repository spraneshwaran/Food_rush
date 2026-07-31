import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Smartphone, Banknote, Wallet, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ordersAPI } from '../../api/orders';
import useCartStore from '../../store/cartStore';
import useOrderStore from '../../store/orderStore';
import toast from 'react-hot-toast';

const addressSchema = z.object({
  street: z.string().min(5, 'Street address too short'),
  city: z.string().min(2, 'Enter city'),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

const PAYMENT_METHODS = [
  { id: 'card',   label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'upi',    label: 'UPI / GPay / PhonePe', icon: Smartphone },
  { id: 'cod',    label: 'Cash on Delivery',     icon: Banknote },
  { id: 'wallet', label: 'FoodRush Wallet',       icon: Wallet },
];

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { items, restaurantId, clearCart, getSubtotal } = useCartStore();
  const { startTracking } = useOrderStore();
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const deliveryFee = 30;
  const tax = parseFloat((subtotal * 0.05).toFixed(2));
  const total = subtotal + deliveryFee + tax;

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: { city: 'Mumbai' },
  });

  const onSubmit = async (addressData) => {
    if (!items.length) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      const orderItems = items.map(i => ({
        menuItemId: i._id,
        quantity: i.quantity,
        customizations: i.customizations || [],
      }));

      const { data } = await ordersAPI.place({
        restaurantId,
        items: orderItems,
        deliveryAddress: addressData,
        paymentMethod,
      });

      clearCart();
      const order = data.data;
      startTracking(order);
      setSuccess(true);

      setTimeout(() => navigate(`/orders/${order._id}/track`), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Order Placed! 🎉</h2>
          <p className="text-gray-500">Redirecting to tracking...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-8 page-container">
      <h1 className="section-title mb-6">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Address */}
            <div className="card p-5">
              <h3 className="flex items-center gap-2 font-display font-bold text-gray-900 dark:text-white mb-4">
                <MapPin className="text-brand-500" size={20} /> Delivery Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Street Address *</label>
                  <input {...register('street')} className="input" placeholder="House no, Street, Area..." />
                  {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">City *</label>
                  <input {...register('city')} className="input" placeholder="City" />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Pincode</label>
                  <input {...register('pincode')} className="input" placeholder="400001" />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="card p-5">
              <h3 className="flex items-center gap-2 font-display font-bold text-gray-900 dark:text-white mb-4">
                <CreditCard className="text-brand-500" size={20} /> Payment Method
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === id
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-200 dark:border-dark-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={20} className={paymentMethod === id ? 'text-brand-500' : 'text-gray-500'} />
                    <span className={`text-sm font-medium ${paymentMethod === id ? 'text-brand-600 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {label}
                    </span>
                    {paymentMethod === id && <div className="ml-auto w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="card p-5 sticky top-20">
              <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{item.name} × {item.quantity}</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{((item.discountedPrice || item.price) * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 dark:border-dark-600 pt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>₹{deliveryFee}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>₹{tax.toFixed(0)}</span></div>
                <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-2 border-t border-gray-100 dark:border-dark-600">
                  <span>Total</span><span>₹{total.toFixed(0)}</span>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-5">
                {loading ? 'Placing order...' : `Place Order • ₹${total.toFixed(0)}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
