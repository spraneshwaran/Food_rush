import { CheckCircle, Clock, ChefHat, Bike, Package, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
  { key: 'pending',          label: 'Order Placed',    icon: Package,     color: 'from-blue-500 to-blue-600' },
  { key: 'confirmed',        label: 'Confirmed',       icon: CheckCircle, color: 'from-purple-500 to-purple-600' },
  { key: 'preparing',        label: 'Preparing',       icon: ChefHat,     color: 'from-orange-500 to-orange-600' },
  { key: 'out_for_delivery', label: 'On the way',      icon: Bike,        color: 'from-brand-500 to-brand-600' },
  { key: 'delivered',        label: 'Delivered 🎉',    icon: CheckCircle, color: 'from-green-500 to-green-600' },
];

const STATUS_ORDER = STEPS.map(s => s.key);

export default function OrderTracker({ status, statusHistory = [], orderCreatedAt, estimatedTime }) {
  if (status === 'cancelled') {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <XCircle size={32} className="text-red-500" />
        </div>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">Order Cancelled</p>
        <p className="text-sm text-gray-500">Your order has been cancelled</p>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(status);

  // Helper to format date & time
  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Helper to get actual or estimated time for a step
  const getStepTime = (stepKey, index) => {
    const historyItem = statusHistory.find(h => h.status === stepKey);
    if (historyItem) {
      return {
        time: formatTime(historyItem.timestamp),
        date: formatDate(historyItem.timestamp),
        isActual: true
      };
    }

    // Estimate based on total delivery time
    if (estimatedTime && orderCreatedAt) {
      const start = new Date(orderCreatedAt).getTime();
      const end = new Date(estimatedTime).getTime();
      const totalDuration = end - start;

      // Distribution weights for steps
      const weights = [0, 0.1, 0.4, 0.8, 1]; // pending, confirmed, preparing, out_for_delivery, delivered
      const estimatedStepTime = new Date(start + totalDuration * weights[index]);

      return {
        time: formatTime(estimatedStepTime),
        isActual: false
      };
    }
    return null;
  };

  return (
    <div className="space-y-2">
      {estimatedTime && status !== 'delivered' && (
        <div className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 font-medium mb-4">
          <Clock size={16} />
          <span>Estimated delivery: {formatTime(estimatedTime)}</span>
        </div>
      )}

      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-dark-600" />
        <motion.div
          className="absolute left-6 top-6 w-0.5 bg-gradient-to-b from-brand-500 to-brand-300"
          initial={{ height: 0 }}
          animate={{ height: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />

        <div className="space-y-6 relative">
          {STEPS.map((step, i) => {
            const isCompleted = i <= currentIdx;
            const isActive = i === currentIdx;
            const Icon = step.icon;
            const stepTime = getStepTime(step.key, i);

            return (
              <div key={step.key} className="flex items-start gap-4">
                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                  isCompleted
                    ? `bg-gradient-to-br ${step.color} shadow-lg`
                    : 'bg-gray-100 dark:bg-dark-700'
                }`}>
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-brand-500/30"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <Icon size={20} className={isCompleted ? 'text-white' : 'text-gray-400'} />
                </div>
                <div className="pt-1">
                  <p className={`font-semibold ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                    {step.label}
                  </p>
                  {stepTime && (
                    <p className={`text-[10px] mt-0.5 ${stepTime.isActual ? 'text-gray-500' : 'text-gray-400 italic'}`}>
                      {stepTime.isActual
                        ? `${stepTime.time}, ${stepTime.date}`
                        : `Estimated ${stepTime.time}`
                      }
                    </p>
                  )}
                  {isActive && status !== 'delivered' && (
                    <p className="text-[10px] text-brand-500 mt-1 font-medium animate-pulse uppercase tracking-wider">In progress</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
