import { ReactNode, useState } from 'react';
import { Navbar } from './Navbar';
import { AdminSidebar, SidebarNav } from './AdminSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isSidebarCollapsed } = useUIStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <AdminSidebar />

        {/* Mobile Sidebar Trigger (Floating or in Header? Let's check Navbar opacity/z-index. Navbar is sticky top-0 z-50. 
           We might need a trigger if it's not in Navbar. The standard is usually in Navbar. 
           However, I am editing AdminLayout. The Navbar is separate. 
           Let's put a trigger in the main area for mobile only if needed, OR relies on Navbar?
           Wait, Navbar.tsx has its own Mobile menu for links, but Admin Sidebar is different.
           Let's add a trigger button visible only on mobile in the top-left of the main content area.
        */}

        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent side="left" className="p-0 w-72">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Admin Menu</h2>
            </div>
            <SidebarNav onItemClick={() => setIsMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <main
          className={cn(
            "flex-1 transition-all duration-300 bg-slate-100/50 min-h-[calc(100vh-4rem)]",
            isSidebarCollapsed ? "md:pl-16" : "md:pl-64"
          )}
        >
          {/* Mobile Menu Trigger */}
          <div className="md:hidden p-4 pb-0">
            <Button variant="outline" size="sm" onClick={() => setIsMobileOpen(true)} className="gap-2">
              <Menu className="h-4 w-4" />
              Admin Menu
            </Button>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
