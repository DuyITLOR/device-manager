'use client';

import { useCallback, useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { requireAuthAndRole } from '@/lib/utils/auth';
import { fetchAllActivityLog } from '@/lib/services/activityLog';
import type { activityLogItem, ActivityAction } from '@/lib/types/log';
import PaginationComponent from '@/components/ui/pagination-component';
import { Loading } from '@/components/ui/loading';
import ActivityTable from '@/components/activity/activity-table';
import ActivityFilterForm from '@/components/activity/activity-filter-form';
import { Loader2 } from 'lucide-react';

const AdminActivityComponents = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [activities, setActivities] = useState<activityLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [curPage, setCurPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const ok = requireAuthAndRole(router, toast, ['ADMIN']);
    setHasAccess(ok);
  }, [router, toast]);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      const actionParam = searchParams.get('action') || 'all';
      const response = await fetchAllActivityLog({
        action: actionParam !== 'all' ? (actionParam as ActivityAction) : undefined,
        page: curPage,
        limit: itemsPerPage,
      });
      setActivities(response.data);
      setTotalPages(response.meta.totalPages || 1);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải nhật ký hoạt động',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams, curPage, toast]);

  useEffect(() => {
    if (!hasAccess) return;
    loadActivities();
  }, [hasAccess, loadActivities]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    setCurPage(page);
    router.replace(`/admin/activity?${params.toString()}`);
  };

  const handleActionChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('action');
    } else {
      params.set('action', value);
    }
    params.set('page', '1');
    setCurPage(1);
    router.replace(`/admin/activity?${params.toString()}`);
  };

  if (hasAccess === null) return null;
  if (hasAccess === false) return null;

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold gradient-text'>Nhật ký hoạt động</h1>
        <p className='text-muted-foreground mt-1'>Theo dõi tất cả hoạt động và thay đổi hệ thống</p>
      </div>
      <div className='max-w-7xl mx-auto space-y-6'>
        <Card className='glass-card'>
          <CardHeader>
            <ActivityFilterForm
              selectedAction={searchParams.get('action') || 'all'}
              onActionChange={handleActionChange}
            />
          </CardHeader>
          {loading ? (
            <CardContent>
              <Loading />
            </CardContent>
          ) : (
            <CardContent>
              <ActivityTable activities={activities} />
              <PaginationComponent currentPage={curPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default function AdminActivityPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      }
    >
      <AdminActivityComponents />
    </Suspense>
  );
}
