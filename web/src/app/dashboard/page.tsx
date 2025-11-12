'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { requireAuthAndRole } from '@/lib/utils/auth';

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const ok = requireAuthAndRole(router, toast, ['ADMIN', 'USER', 'MANAGER']);
    setHasAccess(ok);
  }, [router, toast]);

  if (hasAccess === null) return null;
  if (hasAccess === false) return null;

  router.push('/dashboard/available');
  return null;
}
