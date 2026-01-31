import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

// Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import InvoicePage from "./pages/InvoicePage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import UserSignupPage from "./pages/auth/UserSignupPage";
import VendorSignupPage from "./pages/auth/VendorSignupPage";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import VendorDashboard from "./pages/dashboard/VendorDashboard";
import VendorSettings from "./pages/dashboard/VendorSettings";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminSettings from "./pages/dashboard/AdminSettings";
import ManageUsers from "./pages/dashboard/ManageUsers";
import ManageVendors from "./pages/dashboard/ManageVendors";
import ManageProducts from "./pages/dashboard/ManageProducts";
import ManageOrders from "./pages/dashboard/ManageOrders";
import ReportsAnalytics from "./pages/dashboard/ReportsAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles?: ('ADMIN' | 'VENDOR' | 'CUSTOMER')[];
}) {
  const { isAuthenticated, getUserRole } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }
  
  const userRole = getUserRole();
  
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = userRole === 'ADMIN' ? '/admin/dashboard' : userRole === 'VENDOR' ? '/vendor/dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children}</>;
}

// Public Route - redirects authenticated users away from auth pages
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Dashboard Router - redirects based on role
function DashboardRouter() {
  const { getUserRole } = useAuthStore();
  const role = getUserRole();
  
  if (role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (role === 'VENDOR') {
    return <Navigate to="/vendor/dashboard" replace />;
  }
  return <CustomerDashboard />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          
          {/* Auth Routes - Only accessible when not authenticated */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup/user" 
            element={
              <PublicRoute>
                <UserSignupPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup/vendor" 
            element={
              <PublicRoute>
                <VendorSignupPage />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes - Require Authentication */}
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } 
          />
          
          {/* Customer Routes */}
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoice/:id" 
            element={
              <ProtectedRoute>
                <InvoicePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Vendor Routes */}
          <Route 
            path="/vendor/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['VENDOR', 'ADMIN']}>
                <VendorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vendor/settings" 
            element={
              <ProtectedRoute allowedRoles={['VENDOR', 'ADMIN']}>
                <VendorSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vendor" 
            element={
              <Navigate to="/vendor/dashboard" replace />
            } 
          />
          <Route 
            path="/vendor/*" 
            element={
              <ProtectedRoute allowedRoles={['VENDOR', 'ADMIN']}>
                <VendorDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ManageUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/vendors" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ManageVendors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/products" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ManageProducts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ManageOrders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ReportsAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <Navigate to="/admin/dashboard" replace />
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
