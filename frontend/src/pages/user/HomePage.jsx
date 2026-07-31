import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Star, Clock, Flame, ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { restaurantsAPI } from '../../api/restaurants';
import RestaurantCard from '../../components/RestaurantCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const CUISINES = [
  { name: 'Biryani', emoji: '🍚', color: 'from-amber-400 to-orange-500' },
  { name: 'Pizza', emoji: '🍕', color: 'from-red-400 to-rose-500' },
  { name: 'Burgers', emoji: '🍔', color: 'from-yellow-400 to-amber-500' },
  { name: 'Chinese', emoji: '🥢', color: 'from-red-500 to-orange-400' },
  { name: 'North Indian', emoji: '🍛', color: 'from-orange-400 to-amber-500' },
  { name: 'Healthy', emoji: '🥗', color: 'from-green-400 to-emerald-500' },
  { name: 'South Indian', emoji: '🥘', color: 'from-teal-400 to-cyan-500' },
  { name: 'Desserts', emoji: '🍰', color: 'from-pink-400 to-rose-400' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    restaurantsAPI.getFeatured()
      .then(({ data }) => setFeatured(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-500 to-orange-400 overflow-hidden py-20 md:py-28">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="page-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
              <MapPin size={14} /> Mumbai, Maharashtra
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
              Hungry? We've got<br />
              <span className="text-yellow-300">you covered 🔥</span>
            </h1>
            <p className="text-white/80 text-lg mb-10">
              Order from top restaurants near you. Fast delivery, fresh food.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
              <div className="flex items-center bg-white dark:bg-dark-800 rounded-2xl shadow-xl overflow-hidden">
                <Search className="ml-5 text-gray-400 shrink-0" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search restaurants or cuisines..."
                  className="flex-1 px-4 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-base"
                />
                <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-4 transition-colors shrink-0">
                  Search
                </button>
              </div>
            </form>

            {/* Quick stats */}
            <div className="flex items-center justify-center gap-8 mt-10 text-white/90">
              {[['500+', 'Restaurants'], ['20 min', 'Avg delivery'], ['4.5★', 'Rating']].map(([val, label]) => (
                <div key={label} className="text-center">
                  <div className="font-display font-bold text-2xl text-yellow-300">{val}</div>
                  <div className="text-sm text-white/70">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cuisine Categories */}
      <section className="py-12 page-container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">What's on your mind?</h2>
          <Link to="/restaurants" className="text-sm text-brand-500 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            See all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {CUISINES.map((cuisine, i) => (
            <motion.div
              key={cuisine.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={`/restaurants?cuisine=${encodeURIComponent(cuisine.name)}`}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${cuisine.color} rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-md group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  {cuisine.emoji}
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{cuisine.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="pb-16 page-container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">Top Picks For You ⭐</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Highest rated restaurants near you</p>
          </div>
          <Link to="/restaurants" className="btn-outline py-2 px-4 text-sm">
            View all <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading restaurants..." />
        ) : featured.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🍽</p>
            <p>No restaurants available. Make sure the backend is running and seeded.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((r, i) => <RestaurantCard key={r._id} restaurant={r} index={i} />)}
          </div>
        )}
      </section>

      {/* App promo banner */}
      <section className="page-container pb-16">
        <div className="bg-gradient-to-r from-dark-900 via-dark-800 to-dark-700 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">Ready to order?</h3>
            <p className="text-gray-400 mb-6">Browse 500+ restaurants and get food delivered in 30 minutes</p>
            <Link to="/restaurants" className="btn-primary">
              Order Now <ArrowRight size={18} />
            </Link>
          </div>
          <div className="text-8xl animate-bounce">🍔</div>
        </div>
      </section>
    </main>
  );
}
