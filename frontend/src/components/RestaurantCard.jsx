import { Link } from 'react-router-dom';
import { Star, Clock, Bike, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CUISINE_IMAGES = {
  'North Indian': '🍛', 'Biryani': '🍚', 'Chinese': '🥢',
  'Pizza': '🍕', 'Burgers': '🍔', 'Healthy': '🥗', 'South Indian': '🥘', 'Desserts': '🍰',
};

export default function RestaurantCard({ restaurant, index = 0 }) {
  const {
    _id, name, image, cuisines = [], rating = {}, deliveryTime = {},
    deliveryFee = 30, priceForTwo = 300, isOpen = true, tags = []
  } = restaurant;

  const cuisineEmoji = cuisines.length > 0 ? (CUISINE_IMAGES[cuisines[0]] || '🍽') : '🍽';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/restaurant/${_id}`} className="block group">
        <div className="card hover:-translate-y-1 transition-all duration-300">
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-dark-700 dark:to-dark-600 overflow-hidden">
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-7xl opacity-50">{cuisineEmoji}</span>
              </div>
            )}
            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {!isOpen && (
                <span className="bg-gray-900/80 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">Closed</span>
              )}
              {tags.includes('promoted') && (
                <span className="bg-brand-500 text-white text-xs px-2 py-1 rounded-lg">Promoted</span>
              )}
            </div>
            {/* Delivery fee chip */}
            <div className="absolute bottom-3 right-3">
              <span className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-gray-700 dark:text-gray-300 shadow-sm">
                {deliveryFee === 0 ? '🎉 Free Delivery' : `₹${deliveryFee} delivery`}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-brand-500 transition-colors line-clamp-1">
                {name}
              </h3>
              <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-lg shrink-0">
                <Star size={12} className="text-green-600 fill-green-600" />
                <span className="text-xs font-bold text-green-700 dark:text-green-400">
                  {rating.average?.toFixed(1) || '4.0'}
                </span>
                <span className="text-xs text-green-600/70">({rating.count > 999 ? `${(rating.count/1000).toFixed(1)}k` : rating.count || 0})</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
              {cuisines.join(' • ')}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-dark-600 pt-3">
              <div className="flex items-center gap-1">
                <Clock size={13} />
                <span>{deliveryTime.min}–{deliveryTime.max} min</span>
              </div>
              <div className="flex items-center gap-1">
                <span>₹{priceForTwo} for two</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
