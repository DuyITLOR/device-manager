import { Suspense } from 'react';
import DeviceManagementPage from '@/components/device/device-management-page';
import { Loader2 } from 'lucide-react';

export default function AvailableDevices() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      }
    >
      <DeviceManagementPage />
    </Suspense>
  );
}
