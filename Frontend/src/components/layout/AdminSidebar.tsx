import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
    description: 'Overview & analytics',
  },
  {
    title: 'Manage Users',
    icon: Users,
    href: '/admin/users',
    description: 'User management',
  },
  {
    title: 'Manage Products',
    icon: Package,
    href: '/admin/products',
    description: 'Product catalog',
  },
  {
    title: 'Manage Orders',
    icon: ShoppingCart,
    href: '/admin/orders',
    description: 'Order management',
  },
  {
    title: 'Reports & Analytics',
    icon: BarChart3,
    href: '/admin/reports',
    description: 'Business insights',
  },
  {
    title: 'System Settings',
    icon: Settings,
    href: '/admin/settings',
    description: 'Configuration',
  },
];

interface SidebarNavProps {
  isCollapsed?: boolean;
  onItemClick?: () => void;
}

export function SidebarNav({ isCollapsed, onItemClick }: SidebarNavProps) {
  const location = useLocation();

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.href ||
          (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onItemClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            title={isCollapsed ? item.title : undefined}
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary')} />
            {!isCollapsed && (
              <span>{item.title}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

import { useUIStore } from '@/stores/uiStore';

// ... (SidebarNav remains same)

export function AdminSidebar({ className }: { className?: string }) {
  const { isSidebarCollapsed, setSidebarCollapsed } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-card transition-all duration-300 hidden md:block rounded-tr-3xl rounded-br-3xl shadow-2xl',
        isSidebarCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          {!isSidebarCollapsed && (
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Main Menu
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="ml-auto h-8 w-8"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <SidebarNav isCollapsed={isSidebarCollapsed} />

        {/* Footer Info */}
        <div className="border-t p-4 mt-auto">
          {!isSidebarCollapsed ?
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  window.location.href = '/login';
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
            : <Button
              variant="ghost"
              size="icon"
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          }
        </div>
      </div>
    </aside>
  );
}
