import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
const AdminHeader = () => {
  const router = useRouter();
  return (
    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
      <div>
        <h1 className='text-3xl font-bold gradient-text'>Bảng điều khiển Admin</h1>
        <p className='text-muted-foreground mt-1'>Quản lý thiết bị, người dùng và hoạt động hệ thống</p>
      </div>
      <Button variant='outline' onClick={() => router.push('/')} className='glass-button'>
        <LogOut className='w-4 h-4 mr-2' />
        Đăng xuất
      </Button>
    </div>
  );
};

export default AdminHeader;
