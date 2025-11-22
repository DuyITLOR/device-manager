'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import type { Device } from '@/lib/types/device';
import { DEVICE_STATUS_MAP, DEVICE_STATUS_VARIANTS } from '@/lib/mapper/deviceStatus';

interface DeviceTableProps {
  devices: Device[];
  onDelete?: (deviceId: string) => void;
}
export default function DeviceTable({ devices, onDelete }: DeviceTableProps) {
  return (
    <div className='rounded-lg border overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên thiết bị</TableHead>
            <TableHead className='hidden md:table-cell'>Mô tả</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className='text-right'>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell className='font-medium'>{device.name}</TableCell>
              <TableCell className='hidden md:table-cell text-muted-foreground'>{device.description}</TableCell>
              <TableCell>
                <Badge variant={DEVICE_STATUS_VARIANTS[device.status]}>{DEVICE_STATUS_MAP[device.status]}</Badge>
              </TableCell>
              <TableCell className='text-right'>
                <div className='flex justify-end gap-2'>
                  <Button size='sm' variant='ghost'>
                    <Edit className='w-4 h-4' />
                  </Button>
                  <Button size='sm' variant='ghost' onClick={() => onDelete?.(device.id)}>
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
