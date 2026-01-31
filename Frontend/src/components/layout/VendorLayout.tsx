import { ReactNode, useState } from "react";
import { Navbar } from "./Navbar";
import { VendorSidebar } from "./VendorSidebar";
import { cn } from "@/lib/utils";

interface VendorLayoutProps {
  children: ReactNode;
}

export function VendorLayout({ children }: VendorLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 relative">
        <VendorSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        <main
          className={cn(
            "flex-1 transition-all duration-300 bg-muted/30 min-h-[calc(100vh-4rem)]",
            isSidebarCollapsed ? "md:pl-16" : "md:pl-64"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
