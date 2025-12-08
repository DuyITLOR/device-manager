'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, QrCode, Delete } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getRole } from '@/lib/utils/auth';
import DeviceTable from '@/components/device/device-table';
import { Device, DeviceParams, DeviceStatus } from '@/lib/types/device';
import { deleteDevice, fetchAllDevices, fetchDeviceById } from '@/lib/services/devices';
import { Loading } from '@/components/ui/loading';
import PaginationComponent from '@/components/ui/pagination-component';
import DeviceFilterForm from '@/components/device/device-filter-form';
import { useForm } from 'react-hook-form';
import CreateDeviceDialog from '@/components/device/create-device-dialog';
import EditDeviceDialog from '@/components/device/edit-device-dialog';
import { exportQrPdf } from '@/lib/services/qr';
import { QRScannerDialog } from '@/components/device/qr-scanner-dialog';
import { DeviceDetailDialog } from '@/components/device/device-detail-dialog';
import { createTransferRequest } from '@/lib/services/transfer';

interface FilterFormData {
  name: string;
  status: string;
}

const DeviceManagementPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  // QR Scanner & Device Detail states
  const [scannedDevice, setScannedDevice] = useState<Device | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [loadingDeviceDetail, setLoadingDeviceDetail] = useState(false);

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [curPage, setCurPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isExporting, setIsExporting] = useState(true);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const [hasManagement, setHasManagement] = useState<boolean>(false);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    const role = getRole();
    setHasManagement(role === 'ADMIN' || role === 'MANAGER');
  }, []);

  const { register, handleSubmit, setValue, watch } = useForm<FilterFormData>({
    defaultValues: {
      name: searchParams.get('name') || '',
      status: searchParams.get('status') || '',
    },
  });

  const statusValue = watch('status');

  const onSubmit = (data: FilterFormData) => {
    const params = new URLSearchParams();
    if (data.name) params.set('name', data.name);
    if (data.status && data.status !== 'all') params.set('status', data.status);
    params.set('page', '1');
    setCurPage(1);
    router.replace(`?${params.toString()}`);
  };

  const handleChangeMode = () => {
    setIsExporting(false);
  };
  const handleExportQR = async () => {
    if (selectedDevices.length === 0) {
      toast({
        title: 'Chưa chọn thiết bị',
        description: 'Vui lòng chọn ít nhất một thiết bị để xuất QR',
        variant: 'destructive',
      });

      return;
    }

    try {
      const pdf = await exportQrPdf(selectedDevices);

      const url = URL.createObjectURL(pdf);
      window.open(url, '_blank');

      toast({
        title: 'Thành công',
        description: 'Đã xuất QR PDF thành công!',
      });

      setIsExporting(false);
      setSelectedDevices([]);
    } catch (err: any) {
      toast({
        title: 'Lỗi xuất QR',
        description: err.message || 'Không thể xuất QR',
        variant: 'destructive',
      });

      setIsExporting(false);
      setSelectedDevices([]);
    }
  };

  const handleToggleSelect = (deviceId: string) => {
    setSelectedDevices((prev) => (prev.includes(deviceId) ? prev.filter((i) => i !== deviceId) : [...prev, deviceId]));
  };

  const handleExitExportQR = () => {
    setIsExporting(true);
    setSelectedDevices([]);
  };

  // Smooth UX flow: Scan QR -> Camera closes -> 1 second delay -> Show device detail
  const handleQRScanSuccess = async (deviceId: string) => {
    try {
      const device = await fetchDeviceById(deviceId);

      setTimeout(() => {
        setScannedDevice(device);
        setDetailDialogOpen(true);
      }, 1000);

      console.log('Scanned device:', device);

      toast({
        title: 'Đã quét thành công',
        description: 'Đang tải thông tin thiết bị...',
      });
    } catch (err: any) {
      toast({
        title: 'Không tìm thấy thiết bị',
        description: err.message || 'Mã QR không hợp lệ hoặc thiết bị không tồn tại',
        variant: 'destructive',
      });
    }
  };

  const handleRowClick = async (device: Device) => {
    if (loadingDeviceDetail) return;

    try {
      setLoadingDeviceDetail(true);
      const detail = await fetchDeviceById(device.id);
      setScannedDevice(detail);
      setDetailDialogOpen(true);
    } catch (err: any) {
      toast({
        title: 'Lỗi',
        description: err.message || 'Không thể tải thông tin thiết bị',
        variant: 'destructive',
      });
    } finally {
      setLoadingDeviceDetail(false);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    setCurPage(page);
    router.replace(`?${params.toString()}`);
  };

  const handleDeleteDevices = async (deviceId: string) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?');
    if (!confirmed) return;
    try {
      await deleteDevice(deviceId);
      toast({
        title: 'Thành công',
        description: 'Đã xóa thiết bị thành công.',
      });
      loadDevices();
    } catch (err: any) {
      const msg = err?.message ?? 'Lỗi khi xóa thiết bị';
      toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
    }
  };

  const loadDevices = useCallback(async () => {
    setLoading(true);
    try {
      const params: DeviceParams = {
        limit: 10,
        page: curPage,
        name: searchParams.get('name') || '',
      };

      const statusParam = searchParams.get('status') || '';
      if (statusParam && statusParam !== 'all') {
        params.status = statusParam as DeviceStatus;
      }

      const res = await fetchAllDevices(params);
      console.log('Fetched devices:', res.data);
      setDevices(res.data);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err: any) {
      const msg = err?.message ?? 'Lỗi khi tải danh sách người dùng';
      toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [searchParams, curPage, toast]);

  const handleTransferDevice = async () => {
    if (!scannedDevice) return;
    setIsTransferring(true);
    try {
      const request = await createTransferRequest(scannedDevice.id);
      toast({
        title: 'Yêu cầu chuyển thiết bị thành công',
        description: `Yêu cầu chuyển thiết bị đã được tạo với mã #${request.id}`,
      });
      setDetailDialogOpen(false);
    } catch (err: any) {
      const msg = err?.message ?? 'Lỗi khi tạo yêu cầu chuyển thiết bị';
      toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
    } finally {
      setIsTransferring(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);
  return (
    <div className='min-h-screen p-4 md:p-8'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <Card className='glass-card'>
          <CardHeader>
            {hasManagement && (
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4'>
                <div>
                  <CardTitle className='text-2xl'>Quản lý thiết bị</CardTitle>
                  <CardDescription className='mt-1'>Thêm, chỉnh sửa và quản lý tất cả thiết bị</CardDescription>
                </div>
                <div className='flex flex-col md:flex-row gap-2'>
                  {/* QR Scanner Button - Always visible */}
                  <QRScannerDialog onScanSuccess={handleQRScanSuccess} />

                  {isExporting ? (
                    <Button variant='outline' onClick={handleChangeMode} className='glass-button'>
                      <QrCode />
                      <p>Chọn thiết bị xuất QR</p>
                    </Button>
                  ) : (
                    <div className='flex gap-2'>
                      <Button variant='destructive' onClick={handleExitExportQR}>
                        <Delete />
                      </Button>

                      <Button variant='outline' onClick={handleExportQR} className='glass-button'>
                        <QrCode />
                        <p>Xuất QR ({selectedDevices.length})</p>
                      </Button>
                    </div>
                  )}

                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className='w-4 h-4 mr-2' />
                    Thêm thiết bị
                  </Button>
                </div>
              </div>
            )}

            {!hasManagement && (
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4'>
                <div>
                  <CardTitle className='text-2xl'>Tất cả thiết bị</CardTitle>
                  <CardDescription className='mt-1'>Tìm kiếm các thiết bị có sẵn trong hệ thống</CardDescription>
                </div>
                <div className='flex gap-2'>
                  {/* QR Scanner Button for regular users */}
                  <QRScannerDialog onScanSuccess={handleQRScanSuccess} />
                </div>
              </div>
            )}

            <DeviceFilterForm
              register={register}
              handleSubmit={handleSubmit}
              setValue={setValue}
              statusValue={statusValue}
              onSubmit={onSubmit}
            />
          </CardHeader>
          {loading ? (
            <CardContent>
              <Loading />
            </CardContent>
          ) : (
            <CardContent>
              <DeviceTable
                devices={devices}
                onDelete={handleDeleteDevices}
                onEdit={(device) => {
                  setEditingDevice(device);
                  setEditDialogOpen(true);
                }}
                onRowClick={handleRowClick}
                selectTable={!isExporting}
                selectIds={selectedDevices}
                onToggleSelect={handleToggleSelect}
                hasManagement={hasManagement}
                loadingRow={loadingDeviceDetail}
              />
              <PaginationComponent currentPage={curPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </CardContent>
          )}
        </Card>

        <CreateDeviceDialog
          isOpen={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onDeviceCreated={() => {
            setCreateDialogOpen(false);
            loadDevices();
          }}
        />
        <EditDeviceDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          device={editingDevice}
          onSuccess={() => {
            setEditingDevice(null);
            setEditDialogOpen(false);
            loadDevices();
          }}
        />

        {/* Device Detail Dialog - Shows after QR scan */}
        <DeviceDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          device={scannedDevice}
          onClickTransfer={handleTransferDevice}
          isTransferring={isTransferring}
        />
      </div>
    </div>
  );
};

export default DeviceManagementPage;
