import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Star, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { restaurantsAPI } from '../../api/restaurants';
import RestaurantCard from '../../components/RestaurantCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'deliveryTime', label: 'Delivery Time' },
  { value: 'price', label: 'Price' },
  { value: 'popular', label: 'Popularity' },
];

const CUISINES = ['Biryani', 'Pizza', 'Burgers', 'Chinese', 'North Indian', 'Healthy', 'South Indian', 'Desserts'];

export default function RestaurantsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('rating');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || '');
  const [minRating, setMinRating] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort, page, limit: 12 };
      if (search) params.search = search;
      if (selectedCuisine) params.cuisine = selectedCuisine;
      if (minRating) params.minRating = minRating;
      if (isOpen) params.isOpen = true;

      const { data } = await restaurantsAPI.getAll(params);
      setRestaurants(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [search, sort, selectedCuisine, minRating, isOpen, page]);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const clearFilters = () => {
    setSearch(''); setSelectedCuisine(''); setMinRating(''); setIsOpen(false);
    setSearchParams({});
  };

  const hasFilters = search || selectedCuisine || minRating || isOpen;

  return (
    <main className="min-h-screen py-8 page-container">
      <h1 className="section-title mb-6">All Restaurants</h1>

      {/* Search + controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants..."
            className="input pl-11"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary gap-2 ${showFilters ? 'ring-2 ring-brand-500' : ''}`}
        >
          <SlidersHorizontal size={16} />
          Filters
          {hasFilters && <span className="w-2 h-2 bg-brand-500 rounded-full" />}
        </button>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input pr-10 appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="card p-5 mb-6 overflow-hidden"
          >
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Cuisine</label>
                <div className="flex flex-wrap gap-2">
                  {CUISINES.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedCuisine(selectedCuisine === c ? '' : c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        selectedCuisine === c
                          ? 'bg-brand-500 text-white'
                          : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Min Rating</label>
                <div className="flex gap-2">
                  {['3', '3.5', '4', '4.5'].map(r => (
                    <button
                      key={r}
                      onClick={() => setMinRating(minRating === r ? '' : r)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        minRating === r ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Star size={11} className="fill-current" /> {r}+
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setIsOpen(!isOpen)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${isOpen ? 'bg-brand-500' : 'bg-gray-300 dark:bg-dark-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isOpen ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Open now</span>
              </label>
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 ml-auto">
                  <X size={14} /> Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? 'Loading...' : `${total} restaurants found`}
        </p>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Finding restaurants..." />
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No restaurants found</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r, i) => <RestaurantCard key={r._id} restaurant={r} index={i} />)}
        </div>
      )}
    </main>
  );
}
