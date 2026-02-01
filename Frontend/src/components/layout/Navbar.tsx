import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useRentalStore } from "@/stores/rentalStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { motion } from "framer-motion";
import {
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Search,
  Settings,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CartSheet } from "../products/CartSheet";

export function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout: authLogout, getUserRole } = useAuthStore();
  const { items, fetchCart } = useCartStore();
  const {
    items: wishlistItems,
    fetchWishlist,
    isInitialized,
  } = useWishlistStore();
  const { location: rentalLocation } = useRentalStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
      fetchCart();
    }
  }, [isAuthenticated, fetchWishlist, fetchCart]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const userRole = getUserRole();
  const isAdminOrVendor = userRole === "ADMIN" || userRole === "VENDOR";

  const dashboardLink =
    userRole === "ADMIN" ? "/admin/dashboard"
      : userRole === "VENDOR" ? "/vendor/dashboard"
        : "/dashboard";

  const settingsLink =
    userRole === "ADMIN" ? "/admin/settings"
      : userRole === "VENDOR" ? "/vendor/settings"
        : "/settings";

  const ordersLink =
    userRole === "ADMIN" ? "/admin/orders"
      : userRole === "VENDOR" ? "/vendor/orders"
        : "/orders";

  const isCustomer =
    !isAuthenticated || (userRole !== "ADMIN" && userRole !== "VENDOR");

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <img
            src="/RentX.png"
            alt="RentX Logo"
            className="h-8 sm:h-10 md:h-12 w-auto"
          />
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
            Rent<span className="text-blue-600">X</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        {!isAdminOrVendor && (
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  location.pathname === link.href ?
                    "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* Wishlist */}
          {!isAdminOrVendor && (
            <Link to="/wishlist" className="relative">
              <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 sm:h-10 sm:w-10">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                {wishlistItems.length > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-pink-500 p-0 text-[10px] sm:text-xs text-white">
                    {wishlistItems.length}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          {/* Cart */}
          {isCustomer && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {items.length > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-500 p-0 text-[10px] sm:text-xs text-white">
                    {items.length}
                  </Badge>
                )}
              </Button>
            </div>
          )}

          {/* User Menu */}
          {isAuthenticated ?
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-indigo-100 p-1.5 sm:p-2 pr-2 sm:pr-4 text-indigo-900 hover:bg-indigo-200 transition-colors">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline text-sm font-medium">
                    Hi, {user?.firstName || "User"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />

                {!isAdminOrVendor && (
                  <DropdownMenuItem asChild>
                    <Link to={ordersLink} className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to={settingsLink} className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 cursor-pointer focus:text-red-500"
                  onClick={() => authLogout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            : <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild className="rounded-xl">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="rounded-xl">
                <Link to="/signup/user">Sign Up</Link>
              </Button>
            </div>
          }

          {/* Mobile Menu Button */}
          {!isAdminOrVendor && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl lg:hidden h-9 w-9 sm:h-10 sm:w-10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ?
                <X className="h-5 w-5" />
                : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {!isAdminOrVendor && isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border lg:hidden"
        >
          <nav className="container flex flex-col gap-2 px-3 sm:px-4 py-3 sm:py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "rounded-xl px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors",
                  location.pathname === link.href ?
                    "bg-primary text-primary-foreground"
                    : "hover:bg-muted",
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
                  className="rounded-xl px-3 sm:px-4 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  Login
                </Link>
                <Link
                  to="/signup/user"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl bg-primary px-3 sm:px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
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
    </header>
  );
}
