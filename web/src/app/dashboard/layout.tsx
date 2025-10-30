'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Package, List } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const UserNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className='glass-card mb-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4'>
        <div className='flex gap-2 flex-wrap'>
          <Link
            href='/dashboard/available'
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              pathname === '/dashboard/available'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <div className='flex items-center gap-2'>
              <List className='w-4 h-4' />
              <span>Available Devices</span>
            </div>
          </Link>
          <Link
            href='/dashboard/my-loans'
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              pathname === '/dashboard/my-loans'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <div className='flex items-center gap-2'>
              <Package className='w-4 h-4' />
              <span>My Loan Devices</span>
            </div>
          </Link>
        </div>
        <Button variant='outline' onClick={() => router.push('/')} className='glass-button'>
          <LogOut className='w-4 h-4 mr-2' />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen p-4 md:p-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <UserNavigation />
        {children}
      </div>
    </div>
  );
}
