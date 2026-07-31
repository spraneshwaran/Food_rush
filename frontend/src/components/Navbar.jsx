import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, ChefHat, LayoutDashboard, LogOut, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [scrolled, setScrolled] = useState(false);

  const { user, logout, isAuthenticated } = useAuthStore();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'restaurant') return '/dashboard';
    return '/orders';
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : 'bg-white dark:bg-dark-900'}`}>
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-brand group-hover:scale-105 transition-transform">
              <span className="text-white text-lg">🍔</span>
            </div>
            <span className="font-display font-bold text-xl text-gradient">FoodRush</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/restaurants" className={`text-sm font-medium transition-colors hover:text-brand-500 ${location.pathname === '/restaurants' ? 'text-brand-500' : 'text-gray-600 dark:text-gray-300'}`}>
              Restaurants
            </Link>
            {isAuthenticated() && (
              <Link to="/orders" className={`text-sm font-medium transition-colors hover:text-brand-500 ${location.pathname === '/orders' ? 'text-brand-500' : 'text-gray-600 dark:text-gray-300'}`}>
                My Orders
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Dark mode */}
            <button onClick={() => setDark(!dark)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors" aria-label="Toggle theme">
              {dark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
            </button>

            {/* Cart */}
            {user?.role === 'user' || !user ? (
              <Link to="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                <ShoppingCart size={20} className="text-gray-700 dark:text-gray-300" />
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}
              </Link>
            ) : null}

            {isAuthenticated() ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                  <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name?.split(' ')[0]}</span>
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-48 card shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link to={getDashboardLink()} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 text-sm text-gray-700 dark:text-gray-300">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 transition-colors">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">Login</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-900 overflow-hidden"
          >
            <div className="page-container py-4 flex flex-col gap-3">
              <Link to="/restaurants" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-gray-700 dark:text-gray-300">Restaurants</Link>
              {isAuthenticated() ? (
                <>
                  <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-gray-700 dark:text-gray-300">Dashboard</Link>
                  <Link to="/orders" onClick={() => setMobileOpen(false)} className="text-sm font-medium py-2 text-gray-700 dark:text-gray-300">My Orders</Link>
                  <button onClick={handleLogout} className="text-left text-sm font-medium py-2 text-red-500">Logout</button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary py-2 px-4 text-sm flex-1">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary py-2 px-4 text-sm flex-1">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
