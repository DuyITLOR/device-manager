'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '../ui/badge';
import { DEVICE_STATUS_MAP, DEVICE_STATUS_VARIANTS } from '@/lib/mapper/deviceStatus';
import type { Device } from '@/lib/types/device';
import { Loader2 } from 'lucide-react';

interface DeviceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device | null;
  onClickTransfer?: () => void;
  isTransferring?: boolean;
}

export default function DeviceDetailDialog({
  open,
  onOpenChange,
  device,
  onClickTransfer,
  isTransferring,
}: DeviceDetailDialogProps) {
  if (!device) return null;
  const isDisableTransferButton = device.status !== 'BORROWED' || !device.borrowerId || isTransferring;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Thông tin thiết bị</DialogTitle>
          <DialogDescription>Chi tiết về thiết bị #{device.id}</DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <span className='font-bold text-right'>Tên:</span>
            <span className='col-span-3'>{device.name}</span>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <span className='font-bold text-right'>Trạng thái:</span>
            <div className='col-span-3'>
              <Badge variant={DEVICE_STATUS_VARIANTS[device.status]}>{DEVICE_STATUS_MAP[device.status]}</Badge>
            </div>
          </div>
          {device.status == 'BORROWED' && (
            <div className='grid grid-cols-4 items-center gap-4'>
              <span className='font-bold text-right'>Người mượn:</span>
              <span className='col-span-3'>{device.borrowerName}</span>
            </div>
          )}

          <div className='grid grid-cols-4 items-center gap-4'>
            <span className='font-bold text-right'>Mô tả:</span>
            <span className='col-span-3 text-sm text-gray-500'>{device.description || 'Không có mô tả'}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isTransferring}>
            Đóng
          </Button>
          <Button disabled={isDisableTransferButton} onClick={onClickTransfer}>
            {isTransferring && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isTransferring ? 'Đang chuyển...' : 'Chuyển sang tôi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
