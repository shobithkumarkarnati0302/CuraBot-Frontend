import React from 'react';
import { DoctorNavbar } from '../components/DoctorNavbar';

interface DoctorLayoutProps {
  children: React.ReactNode;
}

export function DoctorLayout({ children }: DoctorLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorNavbar />
      <main className="w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
