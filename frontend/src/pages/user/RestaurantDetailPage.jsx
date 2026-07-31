import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Bike, MapPin, Phone, ChevronLeft, Leaf, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { restaurantsAPI } from '../../api/restaurants';
import MenuItemCard from '../../components/MenuItemCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import useCartStore from '../../store/cartStore';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [search, setSearch] = useState('');
  const totalItems = useCartStore((s) => s.getTotalItems());
  const subtotal = useCartStore((s) => s.getSubtotal());

  useEffect(() => {
    restaurantsAPI.getById(id)
      .then(({ data: res }) => {
        setData(res.data);
        const cats = Object.keys(res.data.menu || {});
        if (cats.length > 0) setActiveCategory(cats[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading restaurant..." />;
  if (!data) return <div className="text-center py-20 text-gray-500">Restaurant not found</div>;

  const { restaurant, menu = {} } = data;
  const categories = Object.keys(menu);

  const filteredMenu = Object.entries(menu).reduce((acc, [cat, items]) => {
    let filtered = items;
    if (vegOnly) filtered = filtered.filter(i => i.isVeg);
    if (search) filtered = filtered.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {});

  return (
    <main className="min-h-screen pb-24">
      {/* Hero */}
      <div className="relative h-56 md:h-72 bg-gradient-to-br from-orange-200 to-orange-100 dark:from-dark-700 dark:to-dark-600 overflow-hidden">
        {restaurant.coverImage && (
          <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <Link to="/restaurants" className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
          <ChevronLeft size={20} className="text-white" />
        </Link>
      </div>

      {/* Restaurant info */}
      <div className="page-container -mt-16 relative z-10">
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 dark:from-dark-700 dark:to-dark-600 flex items-center justify-center text-4xl border-4 border-white dark:border-dark-800 shadow-lg shrink-0 overflow-hidden">
              {restaurant.image ? <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" /> : '🍽'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-1">{restaurant.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{restaurant.cuisines?.join(' • ')}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
                  <Star size={14} className="fill-green-600 text-green-600" />
                  <span className="font-bold text-green-700 dark:text-green-400">{restaurant.rating?.average?.toFixed(1)}</span>
                  <span className="text-green-600/70">({restaurant.rating?.count})</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Clock size={14} /> {restaurant.deliveryTime?.min}–{restaurant.deliveryTime?.max} min
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Bike size={14} /> ₹{restaurant.deliveryFee} delivery
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <MapPin size={14} /> {restaurant.address?.city}
                </div>
              </div>
            </div>
          </div>
          {restaurant.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 border-t border-gray-100 dark:border-dark-600 pt-4">{restaurant.description}</p>
          )}
        </div>

        {/* Menu section */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Category sidebar */}
          <aside className="lg:w-48 shrink-0">
            <div className="card p-3 sticky top-20">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Menu</p>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors mb-1 ${
                    activeCategory === cat
                      ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </aside>

          {/* Menu items */}
          <div className="flex-1 min-w-0">
            {/* Filters */}
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search in menu..."
                  className="input pl-9 py-2.5 text-sm"
                />
              </div>
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  vegOnly ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Leaf size={15} /> Veg only
              </button>
            </div>

            {Object.keys(filteredMenu).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-3xl mb-2">🔍</p>
                <p>No items match your filter</p>
              </div>
            ) : (
              Object.entries(filteredMenu).map(([cat, items]) => (
                <div key={cat} className="card mb-4">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-600">
                    <h3 className="font-display font-bold text-gray-900 dark:text-white">{cat}</h3>
                    <p className="text-xs text-gray-400">{items.length} items</p>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-dark-600">
                    {items.map(item => (
                      <MenuItemCard
                        key={item._id}
                        item={item}
                        restaurantId={restaurant._id}
                        restaurantName={restaurant.name}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating cart bar */}
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-md mx-auto">
            <Link
              to="/cart"
              className="flex items-center justify-between bg-brand-500 hover:bg-brand-600 text-white px-6 py-4 rounded-2xl shadow-brand transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="bg-white/20 text-white font-bold text-sm w-7 h-7 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
                <span className="font-semibold">View Cart</span>
              </div>
              <span className="font-bold">₹{subtotal.toFixed(0)}</span>
            </Link>
          </div>
        </motion.div>
      )}
    </main>
  );
}
