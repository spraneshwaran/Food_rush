import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  role: z.enum(['user', 'restaurant']),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const { register: authRegister, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'user' },
  });

  const role = watch('role');

  const onSubmit = async (data) => {
    const { confirmPassword, ...rest } = data;
    try {
      const result = await authRegister(rest);
      toast.success(`Account created! Welcome, ${result.user.name.split(' ')[0]}! 🎉`);
      if (result.user.role === 'restaurant') navigate('/dashboard');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-600 via-brand-500 to-orange-400 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="text-center relative z-10">
          <div className="text-8xl mb-6">🚀</div>
          <h2 className="font-display text-4xl font-extrabold text-white mb-4">Join FoodRush</h2>
          <p className="text-white/80 text-lg max-w-xs">Register as a customer to order, or as a restaurant to grow your business.</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-dark-900 overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md py-8">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🍔</span>
              </div>
              <span className="font-display font-bold text-xl text-gradient">FoodRush</span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Create account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Start your food journey today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3">
              {[['user', '👤 Customer'], ['restaurant', '🍽 Restaurant']].map(([r, label]) => (
                <label key={r} className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold ${
                  role === r ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'border-gray-200 dark:border-dark-600 text-gray-600 dark:text-gray-400'
                }`}>
                  <input {...register('role')} type="radio" value={r} className="hidden" />
                  {label}
                </label>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input {...register('name')} placeholder="Your full name" className="input pl-11" />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input {...register('email')} type="email" placeholder="you@example.com" className="input pl-11" />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input {...register('phone')} type="tel" placeholder="+91 98765 43210" className="input pl-11" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" className="input pl-11 pr-11" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input {...register('confirmPassword')} type="password" placeholder="Repeat password" className="input pl-11" />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-2">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-semibold hover:text-brand-600">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
