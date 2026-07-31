import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password required'),
});

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    try {
      const result = await login(data);
      toast.success(`Welcome back, ${result.user.name.split(' ')[0]}! 👋`);
      if (result.user.role === 'admin') navigate('/admin');
      else if (result.user.role === 'restaurant') navigate('/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-600 via-brand-500 to-orange-400 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="text-center relative z-10">
          <div className="text-8xl mb-6">🍔</div>
          <h2 className="font-display text-4xl font-extrabold text-white mb-4">FoodRush</h2>
          <p className="text-white/80 text-lg max-w-xs">Your favorite food, delivered blazing fast. 500+ restaurants at your fingertips.</p>
          <div className="flex justify-center gap-6 mt-8 text-white/90">
            {[['500+', 'Restaurants'], ['30min', 'Delivery'], ['4.5★', 'Rating']].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="font-display font-bold text-2xl text-yellow-300">{v}</div>
                <div className="text-sm text-white/70">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-dark-900">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🍔</span>
              </div>
              <span className="font-display font-bold text-xl text-gradient">FoodRush</span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Welcome back!</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input {...register('email')} type="email" placeholder="you@example.com" className="input pl-11" />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Your password" className="input pl-11 pr-11" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-6">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-800 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Test credentials:</p>
            {[
              ['User', 'user@foodrush.com', 'User@123'],
              ['Restaurant', 'spicegarden@foodrush.com', 'Owner@123'],
              ['Admin', 'admin@foodrush.com', 'Admin@123'],
            ].map(([role, email, pass]) => (
              <p key={role} className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-semibold">{role}:</span> {email} / {pass}
              </p>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-500 font-semibold hover:text-brand-600">Sign up free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
