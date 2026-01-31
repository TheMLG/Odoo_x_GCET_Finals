import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
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

export function AdminSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-card transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
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
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
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

        {/* Footer Info */}
        {!isCollapsed && (
          <div className="border-t p-4">
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
          </div>
        )}
      </div>
    </aside>
  );
}
