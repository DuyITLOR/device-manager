'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, Users, History, Bot } from 'lucide-react';
import AccountDropdown from '../user/account-dropdown';
import ChangePasswordDialog from '../user/change-password-dialog';
import { clearUserInfo, getName, getRole } from '@/lib/utils/auth';
import { useEffect, useState } from 'react';

export default function AdminNavigation() {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState('');
  const [userName, setUserName] = useState('');

  const handleLogout = () => {
    router.push('/');
    clearUserInfo();
  };

  useEffect(() => {
    const fetchedRole = getRole() || 'ADMIN';
    const fetchedName = getName() || 'Admin';
    setRole(fetchedRole);
    setUserName(fetchedName);
  }, []);
  return (
    <div className='glass-card p-4'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4'>
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
              <span>Thiết bị</span>
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
              <span>Người dùng</span>
            </div>
          </Link>
          <Link
            href='/admin/chatbot'
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              pathname === '/admin/chatbot'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <div className='flex items-center gap-2'>
              <Bot className='w-4 h-4' />
              <span>Trợ lý ảo</span>
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
              <span>Hoạt động</span>
            </div>
          </Link>
        </div>

        <AccountDropdown
          userName={userName}
          userRole={role}
          onLogout={handleLogout}
          onChangePassword={() => setChangePasswordOpen(true)}
        />
        <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
      </div>
    </div>
  );
}
