import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Settings,
  Search,
  MapPin,
  Heart
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useRentalStore } from '@/stores/rentalStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { CartSheet } from '@/components/products/CartSheet';
import { cn } from '@/lib/utils';

export function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout, getUserRole } = useAuthStore();
  const { items } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { location: rentalLocation } = useRentalStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const userRole = getUserRole();

  const dashboardLink = userRole === 'ADMIN'
    ? '/admin/dashboard'
    : userRole === 'VENDOR'
      ? '/vendor/dashboard'
      : '/dashboard';

  const settingsLink = userRole === 'ADMIN'
    ? '/admin/settings'
    : userRole === 'VENDOR'
      ? '/vendor/settings'
      : '/settings';

  const ordersLink = userRole === 'ADMIN'
    ? '/admin/orders'
    : userRole === 'VENDOR'
      ? '/vendor/orders'
      : '/orders';

  const isCustomer = !isAuthenticated || (userRole !== 'ADMIN' && userRole !== 'VENDOR');

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 items-center rounded-xl bg-blue-600 px-3">
            <span className="text-lg font-bold text-white">Share<span className="text-yellow-300">Pal</span></span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {isCustomer && (
          <div className="hidden flex-1 items-center gap-4 px-8 md:flex">
            {/* Location */}
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted">
              <MapPin className="h-5 w-5" />
              <span className="text-sm font-medium">{rentalLocation}</span>
            </button>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search Icon for Mobile */}
          {isCustomer && (
            <Button variant="ghost" size="icon" className="rounded-xl md:hidden">
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* Wishlist */}
          <Link to="/wishlist" className="relative">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <Badge
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 p-0 text-xs text-white"
                >
                  {wishlistItems.length}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Cart */}
          {isCustomer && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {items.length > 0 && (
                  <Badge
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 p-0 text-xs text-white"
                  >
                    {items.length}
                  </Badge>
                )}
              </Button>
            </div>
          )}

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full bg-gray-900 p-2 pr-4 text-white hover:bg-gray-800">
                  <User className="h-5 w-5" />
                  <span className="hidden text-sm font-medium md:inline">Hi, {user?.firstName || 'User'}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                {userRole !== 'ADMIN' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to={dashboardLink} className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={ordersLink} className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to={settingsLink} className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" asChild className="rounded-xl">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="rounded-xl">
                <Link to="/signup/user">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border md:hidden"
        >
          <nav className="container flex flex-col gap-2 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                  location.pathname === link.href
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Login
                </Link>
                <Link
                  to="/signup/user"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </motion.div>
      )}

      {/* Cart Sheet */}
      <CartSheet open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </motion.header>
  );
}
