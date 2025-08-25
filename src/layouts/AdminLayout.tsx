import React from 'react';
import { AdminNavbar } from '../components/AdminNavbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <main className="w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
