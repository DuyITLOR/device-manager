'use client';

import AdminNavigation from '@/components/layout/admin-navigation';
import AdminHeader from '@/components/layout/admin-header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen p-4 md:p-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <AdminHeader />
        <AdminNavigation />
        {children}
      </div>
    </div>
  );
}
