import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// User pages
import HomePage from './pages/user/HomePage';
import RestaurantsPage from './pages/user/RestaurantsPage';
import RestaurantDetailPage from './pages/user/RestaurantDetailPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import OrderTrackingPage from './pages/user/OrderTrackingPage';
import OrderHistoryPage from './pages/user/OrderHistoryPage';

// Restaurant pages
import RestaurantDashboard from './pages/restaurant/DashboardPage';
import MenuManagementPage from './pages/restaurant/MenuManagementPage';
import RestaurantOrdersPage from './pages/restaurant/OrdersPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminRestaurantsPage from './pages/admin/RestaurantsPage';
import AdminOrdersPage from './pages/admin/OrdersPage';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#1a1a1a', color: '#f9fafb', borderRadius: '12px', fontSize: '14px' },
          success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User + public routes (Navbar shown) */}
        <Route path="/" element={<><Navbar /><HomePage /></>} />
        <Route path="/restaurants" element={<><Navbar /><RestaurantsPage /></>} />
        <Route path="/restaurant/:id" element={<><Navbar /><RestaurantDetailPage /></>} />

        {/* Protected user routes */}
        <Route path="/cart" element={
          <ProtectedRoute roles={['user']}><Navbar /><CartPage /></ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute roles={['user']}><Navbar /><CheckoutPage /></ProtectedRoute>
        } />
        <Route path="/orders/:id/track" element={
          <ProtectedRoute><Navbar /><OrderTrackingPage /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><Navbar /><OrderHistoryPage /></ProtectedRoute>
        } />

        {/* Restaurant owner routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['restaurant']}><RestaurantDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/menu" element={
          <ProtectedRoute roles={['restaurant']}><MenuManagementPage /></ProtectedRoute>
        } />
        <Route path="/dashboard/orders" element={
          <ProtectedRoute roles={['restaurant']}><RestaurantOrdersPage /></ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>
        } />
        <Route path="/admin/restaurants" element={
          <ProtectedRoute roles={['admin']}><AdminRestaurantsPage /></ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute roles={['admin']}><AdminOrdersPage /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
