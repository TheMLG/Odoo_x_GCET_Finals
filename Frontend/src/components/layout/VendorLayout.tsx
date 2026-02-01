import { ReactNode, useState } from "react";
import { Navbar } from "./Navbar";
import { VendorSidebar, VendorSidebarNav } from "./VendorSidebar";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Store } from "lucide-react";

interface VendorLayoutProps {
  children: ReactNode;
}

import { useUIStore } from "@/stores/uiStore";

export function VendorLayout({ children }: VendorLayoutProps) {
  const { isSidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 relative">
        <VendorSidebar />

        {/* Mobile Sidebar */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent side="left" className="p-0 w-72">
            <div className="flex items-center border-b p-4 gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Vendor Portal
                </h2>
              </div>
            </div>
            <VendorSidebarNav onItemClick={() => setIsMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <main
          className={cn(
            "flex-1 transition-all duration-300 bg-muted/30 min-h-[calc(100vh-4rem)]",
            isSidebarCollapsed ? "md:pl-16" : "md:pl-64"
          )}
        >
          {/* Mobile Menu Trigger */}
          <div className="md:hidden p-4 pb-0">
            <Button variant="outline" size="sm" onClick={() => setIsMobileOpen(true)} className="gap-2">
              <Menu className="h-4 w-4" />
              Vendor Menu
            </Button>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
