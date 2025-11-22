'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { updateDevice } from '@/lib/services/devices';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Device, DeviceStatus } from '@/lib/types/device';
import { DEVICE_STATUS_MAP } from '@/lib/mapper/deviceStatus';

interface EditDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device?: Device | null;
  onSuccess?: (updated: Device) => void;
}

const editDeviceSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  description: z.string().optional(),

  status: z.nativeEnum(DeviceStatus, {
    required_error: 'Vui lòng chọn trạng thái',
  }),
});

type EditDeviceFormData = z.infer<typeof editDeviceSchema>;

export default function EditDeviceDialog({ open, onOpenChange, device, onSuccess }: EditDeviceDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EditDeviceFormData>({
    resolver: zodResolver(editDeviceSchema),
  });

  useEffect(() => {
    if (device) {
      setValue('name', device.name ?? '');
      setValue('description', device.description ?? '');
      setValue('status', device.status);
    } else {
      reset();
    }
  }, [device, setValue, reset]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: EditDeviceFormData) => {
    if (!device) return;

    setLoading(true);
    try {
      const updated = await updateDevice(device.id, {
        name: data.name,
        description: data.description || '',
        status: data.status,
      });
      toast({
        title: 'Cập nhật thiết bị thành công',
        variant: 'success',
      });
      onSuccess?.(updated);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Lỗi khi cập nhật thiết bị',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thiết bị</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Tên</Label>
              <Input id='name' placeholder='Nhập tên thiết bị' {...register('name')} />
              {errors.name && <p className='text-red-500 text-sm'>{errors.name.message}</p>}
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='description'>Mô tả</Label>
              <Input id='description' placeholder='Nhập mô tả thiết bị' {...register('description')} />
              {errors.description && <p className='text-red-500 text-sm'>{errors.description.message}</p>}
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='status'>Trạng thái</Label>
              <Select onValueChange={(v) => setValue('status', v as DeviceStatus)} value={watch('status')}>
                <SelectTrigger className='w-48'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='AVAILABLE'>{DEVICE_STATUS_MAP.AVAILABLE}</SelectItem>
                  <SelectItem value='BORROWED'>{DEVICE_STATUS_MAP.BORROWED}</SelectItem>
                  <SelectItem value='MAINTENANCE'>{DEVICE_STATUS_MAP.MAINTENANCE}</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className='text-red-500 text-sm'>{errors.status.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type='submit' disabled={loading}>
              {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
