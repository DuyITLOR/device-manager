import { DeviceStatus } from '../types/device';

export const DEVICE_STATUS_MAP = {
  AVAILABLE: 'Có sẵn',
  BORROWED: 'Đang mượn',
  MAINTENANCE: 'Bảo trì',
};

export const DEVICE_STATUS_VARIANTS: Record<DeviceStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  AVAILABLE: 'default',
  BORROWED: 'secondary',
  MAINTENANCE: 'destructive',
};
