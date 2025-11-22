'use client';

import { useState, useEffect } from 'react';
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
import { createDevice } from '@/lib/services/devices';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CreateDevicesDto, DeviceStatus } from '@/lib/types/device';

interface CreateDeviceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceCreated: () => void;
}

const createDeviceSchema = z.object({
  name: z.string().min(1, 'Tên thiết bị không được để trống'),
  description: z.string().optional(),
  status: z.nativeEnum(DeviceStatus, {
    required_error: 'Vui lòng chọn trạng thái',
  }),
});

type CreateDeviceFormData = z.infer<typeof createDeviceSchema>;

export default function CreateDeviceDialog({ isOpen, onClose, onDeviceCreated }: CreateDeviceDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateDeviceFormData>({
    resolver: zodResolver(createDeviceSchema),
    defaultValues: {
      name: '',
      description: '',
      status: DeviceStatus.AVAILABLE,
    },
  });

  const statusValue = watch('status');

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: CreateDeviceFormData) => {
    setLoading(true);
    try {
      const payload: CreateDevicesDto = {
        name: data.name,
        status: data.status,
        description: data.description || '',
      };

      await createDevice(payload);
      toast({
        title: 'Thành công',
        description: 'Tạo thiết bị mới thành công',
      });
      onDeviceCreated();
      onClose();
    } catch (err: any) {
      toast({
        title: 'Lỗi',
        description: err?.message ?? 'Có lỗi xảy ra khi tạo thiết bị',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Tạo thiết bị mới</DialogTitle>
          <DialogDescription>Vui lòng nhập thông tin thiết bị bên dưới.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Tên thiết bị</Label>
              <Input id='name' placeholder='Nhập tên thiết bị' {...register('name')} />
              {errors.name && <p className='text-sm text-red-600'>{errors.name.message}</p>}
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='description'>Mô tả</Label>
              <Input id='description' placeholder='Nhập mô tả thiết bị' {...register('description')} />
              {errors.description && <p className='text-sm text-red-600'>{errors.description.message}</p>}
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='status'>Trạng thái</Label>
              <Select
                onValueChange={(value) => setValue('status', value as CreateDeviceFormData['status'])}
                value={statusValue}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn trạng thái' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='AVAILABLE'>Có sẵn</SelectItem>
                  <SelectItem value='MAINTENANCE'>Bảo trì</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className='text-sm text-red-600'>{errors.status.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type='submit' disabled={loading}>
              {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
              Tạo thiết bị
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
