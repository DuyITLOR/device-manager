'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Users, History } from 'lucide-react';

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <div className='glass-card p-4'>
      <div className='flex gap-2 flex-wrap'>
        <Link
          href='/admin'
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            pathname === '/admin'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'hover:bg-muted text-muted-foreground'
          }`}
        >
          <div className='flex items-center gap-2'>
            <Package className='w-4 h-4' />
            <span>Devices</span>
          </div>
        </Link>
        <Link
          href='/admin/users'
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            pathname === '/admin/users'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'hover:bg-muted text-muted-foreground'
          }`}
        >
          <div className='flex items-center gap-2'>
            <Users className='w-4 h-4' />
            <span>Users</span>
          </div>
        </Link>
        <Link
          href='/admin/activity'
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            pathname === '/admin/activity'
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'hover:bg-muted text-muted-foreground'
          }`}
        >
          <div className='flex items-center gap-2'>
            <History className='w-4 h-4' />
            <span>Activity</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

