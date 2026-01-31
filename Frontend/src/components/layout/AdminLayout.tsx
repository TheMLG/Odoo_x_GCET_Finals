import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 pl-64 pt-16 bg-slate-100/50">
          {children}
        </main>
      </div>
    </div>
  );
}
