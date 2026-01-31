import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { VENDOR_NAV_ITEMS } from '@/lib/constants';
import {
  ChevronLeft,
  ChevronRight,
  Store,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VendorSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  className?: string;
}

export function VendorSidebar({ isCollapsed, setIsCollapsed, className }: VendorSidebarProps) {
  const location = useLocation();

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
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Vendor Portal
                </h2>
                <p className="text-[10px] text-muted-foreground">
                  Manage your store
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn("h-8 w-8", !isCollapsed && "ml-auto")}
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
          {VENDOR_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/vendor/dashboard' && location.pathname.startsWith(item.href));
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
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary')} />
                {!isCollapsed && (
                  <span>{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Info & Logout */}
        <div className="border-t p-4 mt-auto">
          {!isCollapsed ?
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
