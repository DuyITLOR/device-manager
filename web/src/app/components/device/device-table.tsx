'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import type { Device } from '@/lib/types/device';
import { DEVICE_STATUS_MAP, DEVICE_STATUS_VARIANTS } from '@/lib/mapper/deviceStatus';
import { Checkbox } from '@/components/ui/checkbox';

interface DeviceTableProps {
  devices: Device[];
  onDelete?: (deviceId: string) => void;
  onEdit?: (device: Device) => void;
  onRowClick?: (device: Device) => void;

  selectTable?: boolean;
  selectIds?: string[];
  onToggleSelect?: (deviceId: string) => void;
  hasManagement?: boolean;
  loadingRow?: boolean;
}
export default function DeviceTable({
  devices,
  onDelete,
  onEdit,
  onRowClick,
  selectTable,
  selectIds,
  onToggleSelect,
  hasManagement,
  loadingRow,
}: DeviceTableProps) {
  return (
    <div className='rounded-lg border overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow>
            {selectTable && <TableHead>Chọn</TableHead>}
            <TableHead>Tên thiết bị</TableHead>
            <TableHead className='hidden md:table-cell'>Mô tả</TableHead>
            <TableHead>Trạng thái</TableHead>
            {hasManagement && <TableHead className='text-right'>Thao tác</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow
              key={device.id}
              className={`cursor-pointer hover:bg-muted/50 ${loadingRow ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => onRowClick?.(device)}
            >
              {selectTable && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectIds?.includes(device.id) || false}
                    onCheckedChange={() => onToggleSelect?.(device.id)}
                  />
                </TableCell>
              )}
              <TableCell className='font-medium'>{device.name}</TableCell>
              <TableCell className='hidden md:table-cell text-muted-foreground'>{device.description}</TableCell>
              <TableCell>
                <Badge variant={DEVICE_STATUS_VARIANTS[device.status]}>{DEVICE_STATUS_MAP[device.status]}</Badge>
              </TableCell>
              {hasManagement && (
                <TableCell className='text-right' onClick={(e) => e.stopPropagation()}>
                  <div className='flex justify-end gap-2'>
                    <Button size='sm' variant='ghost' onClick={() => onEdit?.(device)}>
                      <Edit className='w-4 h-4' />
                    </Button>
                    <Button size='sm' variant='ghost' onClick={() => onDelete?.(device.id)}>
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
