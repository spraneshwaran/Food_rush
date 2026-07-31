import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Star } from 'lucide-react';
import { adminAPI } from '../../api/orders';
import { AdminSidebar } from './AdminDashboard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchRestaurants = () => {
    setLoading(true);
    const params = {};
    if (filter !== '') params.isApproved = filter;
    adminAPI.getRestaurants(params)
      .then(({ data }) => setRestaurants(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRestaurants(); }, [filter]);

  const handleApprove = async (id, isApproved) => {
    try {
      const { data } = await adminAPI.approveRestaurant(id, { isApproved });
      setRestaurants(r => r.map(rest => rest._id === id ? data.data : rest));
      toast.success(`Restaurant ${isApproved ? 'approved' : 'rejected'}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-900">
      <AdminSidebar active="/admin/restaurants" />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title">Restaurant Management</h1>
          <div className="flex gap-2">
            {[['', 'All'], ['false', 'Pending'], ['true', 'Approved']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === val ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {loading ? <LoadingSpinner /> : (
          <div className="card divide-y divide-gray-100 dark:divide-dark-700">
            {restaurants.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No restaurants found</div>
            ) : restaurants.map(rest => (
              <div key={rest._id} className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 bg-orange-50 dark:bg-dark-700 rounded-xl flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                  {rest.image ? <img src={rest.image} alt={rest.name} className="w-full h-full object-cover" /> : '🍽'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white">{rest.name}</p>
                  <p className="text-xs text-gray-400">{rest.cuisines?.join(', ')} · {rest.address?.city}</p>
                  <p className="text-xs text-gray-400">Owner: {rest.owner?.name} ({rest.owner?.email})</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rest.rating?.average?.toFixed(1) || '0.0'}</span>
                </div>
                <span className={`badge shrink-0 ${rest.isApproved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {rest.isApproved ? 'Approved' : 'Pending'}
                </span>
                <div className="flex gap-2 shrink-0">
                  {!rest.isApproved && (
                    <button onClick={() => handleApprove(rest._id, true)} className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                      <CheckCircle size={13} /> Approve
                    </button>
                  )}
                  {rest.isApproved && (
                    <button onClick={() => handleApprove(rest._id, false)} className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                      <XCircle size={13} /> Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
