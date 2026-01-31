import {
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
} from "lucide-react";

// Vendor Navigation Items
export const VENDOR_NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/vendor/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    href: "/vendor/orders",
    icon: ShoppingCart,
  },
  {
    label: "Invoices",
    href: "/vendor/invoices",
    icon: FileText,
  },
  {
    label: "Products",
    href: "/vendor/products",
    icon: Package,
  },
  {
    label: "Settings",
    href: "/vendor/settings",
    icon: Settings,
  },
] as const;

// Order Status Configuration
export const ORDER_STATUS_CONFIG = {
  pending: { label: "Pending", variant: "secondary" as const },
  confirmed: { label: "Confirmed", variant: "default" as const },
  active: { label: "Active", variant: "default" as const },
  completed: { label: "Completed", variant: "outline" as const },
  cancelled: { label: "Cancelled", variant: "destructive" as const },
} as const;

// Product Status Configuration
export const PRODUCT_STATUS_CONFIG = {
  in_stock: { label: "In Stock", variant: "default" as const },
  low_stock: { label: "Low Stock", variant: "secondary" as const },
  out_of_stock: { label: "Out of Stock", variant: "destructive" as const },
} as const;

// Product Categories
export const PRODUCT_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "cameras", label: "Cameras" },
  { value: "drones", label: "Drones" },
  { value: "laptops", label: "Laptops" },
  { value: "tablets", label: "Tablets" },
  { value: "audio", label: "Audio" },
  { value: "electronics", label: "Electronics" },
] as const;

// Order Status Options
export const ORDER_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "active", label: "Active" },
  { value: "cancelled", label: "Cancelled" },
] as const;

// Product Status Options
export const PRODUCT_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
] as const;
