'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DeviceTable from '@/components/device/device-table';
import DeviceDetailDialog from '@/components/device/device-detail-dialog';
import { fetchAllLoans } from '@/lib/services/loans';
import { mapLoansToDevices } from '@/lib/mapper/loanToDevice';
import type { Device } from '@/lib/types/device';
import PaginationComponent from '@/components/ui/pagination-component';

function BorrowedPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDeviceDetail, setLoadingDeviceDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchParams.get('search') || '',
        limit: 10,
        page: currentPage,
        status: 'BORROWED' as const, // Chỉ lấy thiết bị đang mượn
      };

      const response = await fetchAllLoans(params);

      // Convert loans to devices using mapper
      const mappedDevices = mapLoansToDevices(response.data);

      setDevices(mappedDevices);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (err: any) {
      toast({
        title: 'Lỗi',
        description: err?.message || 'Không thể tải danh sách thiết bị',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams, currentPage, toast]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    params.set('page', '1');
    setCurrentPage(1);
    router.replace(`?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    setCurrentPage(page);
    router.replace(`?${params.toString()}`);
  };

  const handleRowClick = async (device: Device) => {
    if (loadingDeviceDetail) return;

    setLoadingDeviceDetail(true);
    try {
      setSelectedDevice(device);
      setDetailDialogOpen(true);
    } catch (err: any) {
      toast({
        title: 'Lỗi',
        description: err?.message || 'Không thể tải thông tin thiết bị',
        variant: 'destructive',
      });
    } finally {
      setLoadingDeviceDetail(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold gradient-text'>Thiết bị đã mượn</h1>
        <p className='text-muted-foreground mt-1'>Quản lý các thiết bị đang mượn</p>
      </div>

      <Card className='glass-card'>
        <CardHeader>
          <form onSubmit={handleSearch} className='flex gap-3 mt-4'>
            <Input
              placeholder='Tìm kiếm theo tên thiết bị...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='flex-1'
            />
            <Button type='submit'>
              <Search className='w-4 h-4 mr-2' />
              Tìm kiếm
            </Button>
          </form>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className='flex flex-col justify-center items-center h-64 space-y-4'>
              <Loader2 className='w-8 h-8 animate-spin text-primary' />
              <p className='text-sm text-muted-foreground'>Đang tải dữ liệu...</p>
            </div>
          ) : devices.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
                <Search className='w-8 h-8 text-muted-foreground' />
              </div>
              <h3 className='text-lg font-semibold mb-2'>Không tìm thấy thiết bị</h3>
              <p className='text-sm text-muted-foreground text-center max-w-sm'>
                {searchQuery ? 'Không có thiết bị nào phù hợp với tìm kiếm của bạn' : 'Bạn chưa mượn thiết bị nào'}
              </p>
            </div>
          ) : (
            <>
              <DeviceTable
                devices={devices}
                onRowClick={handleRowClick}
                loadingRow={loadingDeviceDetail}
                hasManagement={false}
              />

              {/* Pagination */}
              <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Device Detail Dialog */}
      <DeviceDetailDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen} device={selectedDevice} />
    </div>
  );
}

export default function BorrowedPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center'>
          <Loader2 className='w-8 h-8 animate-spin text-primary' />
        </div>
      }
    >
      <BorrowedPageContent />
    </Suspense>
  );
}
