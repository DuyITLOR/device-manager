import type { Meta } from './meta';

export enum DeviceStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
  MAINTENANCE = 'MAINTENANCE',
}

export type Device = {
  id: string;
  name: string;
  description: string;
  status: DeviceStatus;
  createdAt?: string;
};

export type DeviceListResponse = {
  status: number;
  success: boolean;
  message: string;
  meta: Meta;
  data: Device[];
};

export type DeviceParams = {
  limit?: number;
  page?: number;
  status?: DeviceStatus;
  search?: string;
};
