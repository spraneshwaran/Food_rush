import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, LayoutDashboard, Menu, ListOrdered, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { menuAPI, restaurantsAPI } from '../../api/restaurants';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function MenuManagementPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', isVeg: true, isBestseller: false });
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    restaurantsAPI.getMyRestaurant().then(({ data }) => {
      const rest = data.data;
      setRestaurantId(rest._id);
      return menuAPI.getByRestaurant(rest._id);
    }).then(({ data }) => {
      const allItems = Object.values(data.data || {}).flat();
      setItems(allItems);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editing) {
        const { data } = await menuAPI.update(editing._id, payload);
        setItems(i => i.map(it => it._id === editing._id ? data.data : it));
        toast.success('Item updated');
      } else {
        const { data } = await menuAPI.create(payload);
        setItems(i => [...i, data.data]);
        toast.success('Item added');
      }
      setShowForm(false); setEditing(null);
      setForm({ name: '', description: '', price: '', category: '', isVeg: true, isBestseller: false });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await menuAPI.delete(id);
      setItems(i => i.filter(it => it._id !== id));
      toast.success('Item deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await menuAPI.toggleAvailability(id);
      setItems(i => i.map(it => it._id === id ? data.data : it));
    } catch { toast.error('Toggle failed'); }
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description || '', price: item.price, category: item.category, isVeg: item.isVeg, isBestseller: item.isBestseller || false });
    setShowForm(true);
  };

  if (loading) return <LoadingSpinner text="Loading menu..." />;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-900">
      <aside className="w-64 bg-white dark:bg-dark-800 border-r border-gray-100 dark:border-dark-700 flex flex-col">
        <div className="p-5 border-b border-gray-100 dark:border-dark-700">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center"><span className="text-white text-sm">🍔</span></div>
            <span className="font-display font-bold text-lg text-gradient">FoodRush</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[['/dashboard', LayoutDashboard, 'Dashboard'], ['/dashboard/menu', Menu, 'Menu Items'], ['/dashboard/orders', ListOrdered, 'Orders']].map(([path, Icon, label]) => (
            <Link key={path} to={path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${path === '/dashboard/menu' ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'}`}>
              <Icon size={18} />{label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-dark-700">
          <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-2 text-sm text-red-500 w-full px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title">Menu Management</h1>
          <button onClick={() => { setEditing(null); setForm({ name: '', description: '', price: '', category: '', isVeg: true, isBestseller: false }); setShowForm(true); }} className="btn-primary">
            <Plus size={18} /> Add Item
          </button>
        </div>

        {/* Add/Edit form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="card p-6 mb-6 overflow-hidden">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{editing ? 'Edit Item' : 'Add New Item'}</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required className="input" placeholder="Item name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Category *</label>
                  <input value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} required className="input" placeholder="e.g. Main Course" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} required min="0" className="input" placeholder="299" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="input resize-none" rows={2} placeholder="Brief description..." />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isVeg} onChange={e => setForm(f => ({...f, isVeg: e.target.checked}))} className="w-4 h-4 accent-green-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isBestseller} onChange={e => setForm(f => ({...f, isBestseller: e.target.checked}))} className="w-4 h-4 accent-brand-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bestseller</span>
                  </label>
                </div>
                <div className="md:col-span-2 flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editing ? 'Update' : 'Add'} Item</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items list */}
        <div className="card">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-2">🍽</p> <p>No menu items yet. Add your first item!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-dark-700">
              {items.map(item => (
                <div key={item._id} className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-dark-700 flex items-center justify-center text-xl shrink-0">🍽</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.name}</p>
                      <div className={`w-3 h-3 border ${item.isVeg ? 'border-green-600' : 'border-red-600'} rounded-sm flex items-center justify-center`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{item.category}</p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">₹{item.price}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleToggle(item._id)} className={`p-1.5 rounded-lg transition-colors ${item.isAvailable ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700'}`}>
                      {item.isAvailable ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 text-gray-500 hover:text-brand-500 transition-colors">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
