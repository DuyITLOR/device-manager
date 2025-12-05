import React from 'react';
const AdminHeader = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
      <div>
        <h1 className='text-3xl font-bold gradient-text'>Bảng điều khiển Admin</h1>
        <p className='text-muted-foreground mt-1'>Quản lý thiết bị, người dùng và hoạt động hệ thống</p>
      </div>
    </div>
  );
};

export default AdminHeader;
