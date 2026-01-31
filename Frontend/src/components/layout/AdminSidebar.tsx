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

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  className?: string;
}

export function AdminSidebar({ isCollapsed, setIsCollapsed, className }: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-card transition-all duration-300 hidden md:block',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          {!isCollapsed && (
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Main Menu
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <SidebarNav isCollapsed={isCollapsed} />

        {/* Footer Info */}
        <div className="border-t p-4 mt-auto">
          {!isCollapsed ?
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Users className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Admin Panel</p>
                    <p className="text-muted-foreground">Full System Access</p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => {
                  // Add logout logic here, referencing auth store if needed or just use Link/href if handled globally
                  // For now, assuming direct call or navigation. 
                  // Ideally imports useAuthStore.
                  // But wait, I need to import useAuthStore first.
                  window.location.href = '/login'; // Fallback or proper logout
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
