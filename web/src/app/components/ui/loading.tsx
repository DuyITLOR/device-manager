import { Loader2 } from 'lucide-react';

export const Loading = () => {
  return (
    <div className='flex flex-col justify-center items-center h-64 space-y-4'>
      <Loader2 className='w-8 h-8 animate-spin text-primary' />
      <p className='text-sm text-muted-foreground'>Đang tải dữ liệu...</p>
    </div>
  );
};
