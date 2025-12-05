'use client';

import UserNavigation from '@/components/layout/user-navigation';
import UserHeader from '@/components/layout/user-header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen p-4 md:p-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <UserHeader />
        <UserNavigation />
        {children}
      </div>
    </div>
  );
}
