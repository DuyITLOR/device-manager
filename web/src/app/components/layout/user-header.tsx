import React from 'react';
import { useRouter } from 'next/navigation';
const UserHeader = () => {
  const router = useRouter();
  return (
    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
      <div>
        <h1 className='text-3xl font-bold gradient-text'>Hệ thống quản lý thiết bị</h1>
        <p className='text-muted-foreground mt-1'>Xem và quản lý thiết bị của bạn</p>
      </div>
    </div>
  );
};

export default UserHeader;
