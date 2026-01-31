import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { VendorSidebar } from "./VendorSidebar";

interface VendorLayoutProps {
  children: ReactNode;
}

export function VendorLayout({ children }: VendorLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <VendorSidebar />
        <main className="flex-1 bg-muted/30">{children}</main>
      </div>
    </div>
  );
}
