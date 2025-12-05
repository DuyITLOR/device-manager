'use client';
import DeviceManagementPage from '@/components/device/device-management-page';

import { useEffect, useState } from 'react';
import { requireAuthAndRole } from '@/lib/utils/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  useEffect(() => {
    const ok = requireAuthAndRole(router, toast, ['ADMIN']);
    setHasAccess(ok);
  }, [router, toast]);

  if (hasAccess === null) return null;
  if (hasAccess === false) return null;
  return <DeviceManagementPage />;
}
