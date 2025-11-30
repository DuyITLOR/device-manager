import { ActivityAction, ActivityTargetType } from '@prisma/client';

export interface LogDiff {
  type: 'UPDATE';
  diff: Record<string, { old: any; new: any }>;
}

export interface LogIdentity {
  type: 'SNAPSHOT'; // Dùng cho Create / Delete
  name: string;
}

export interface LogFlow {
  type: 'FLOW'; // Dùng cho Loan / Transfer
  deviceName: string;
  userName: string;
}

export type LogDetails = LogDiff | LogIdentity | LogFlow;

export interface CreateLogInput {
  actorId: string;
  action: ActivityAction;
  targetType: ActivityTargetType;
  targetId: string;
  details: LogDetails;
}
