import { clearUserInfo, getName, getRole } from '@/lib/utils/auth';
import { Package, List } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AccountDropdown from '../user/account-dropdown';
import { useState } from 'react';
import ChangePasswordDialog from '../user/change-password-dialog';

export default function UserNavigation() {
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    router.push('/');
    clearUserInfo();
  };

  const userName = getName() || 'User';
  const role = getRole() || 'USER';

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
              <span>Tất cả thiết bị</span>
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
              <span>Thiết bị đã mượn</span>
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
