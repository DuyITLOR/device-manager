import type { Meta } from './meta';
import { User } from './user';

export enum ActivityAction {
  LOAN_CREATE = 'LOAN_CREATE',
  LOAN_RETURN = 'LOAN_RETURN',
  LOAN_UPDATE = 'LOAN_UPDATE',
  TRANSFER_REQUEST = 'TRANSFER_REQUEST',
  TRANSFER_APPROVE = 'TRANSFER_APPROVE',
  TRANSFER_REJECT = 'TRANSFER_REJECT',
  TRANSFER_CANCEL = 'TRANSFER_CANCEL',
  DEVICE_CREATE = 'DEVICE_CREATE',
  DEVICE_UPDATE = 'DEVICE_UPDATE',
  DEVICE_DELETE = 'DEVICE_DELETE',
  USER_CREATE = 'USER_CREATE',
  USER_DELETE = 'USER_DELETE',
}

export enum ActivityTargetType {
  Device = 'Device',
  Loan = 'Loan',
  Transfer = 'Transfer',
  User = 'User',
}

export type activityLogItem = {
  id: string;
  actorId: string;
  action: ActivityAction;
  targetType: ActivityTargetType;
  targetId: string;
  timestamp: string;
  details?: Record<string, any>;
  actor?: User;
};

export type QueryActivityLogParams = {
  action?: ActivityAction;
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
};

export type ActivityLogListResponse = {
  status: number;
  success: boolean;
  message: string;
  meta: Meta;
  data: activityLogItem[];
};
