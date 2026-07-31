import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { adminAPI } from '../../api/orders';
import { AdminSidebar } from './AdminDashboard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    adminAPI.getUsers(params)
      .then(({ data }) => setUsers(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const handleToggle = async (id) => {
    try {
      const { data } = await adminAPI.toggleUser(id);
      setUsers(u => u.map(usr => usr._id === id ? data.data : usr));
      toast.success('User status updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-900">
      <AdminSidebar active="/admin/users" />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="section-title mb-6">User Management</h1>
        <div className="flex gap-3 mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input flex-1 max-w-sm" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input w-36">
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="restaurant">Restaurant</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {loading ? <LoadingSpinner /> : (
          <div className="card divide-y divide-gray-100 dark:divide-dark-700">
            {users.map(user => (
              <div key={user._id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <span className={`badge ${user.role === 'admin' ? 'bg-red-100 text-red-700' : user.role === 'restaurant' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span>
                <span className={`badge ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                <button
                  onClick={() => handleToggle(user._id)}
                  disabled={user.role === 'admin'}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
