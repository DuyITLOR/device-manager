import type { Meta } from './meta';

export type User = {
  id: string;
  code?: string | null;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
};

export type UpdateUserDto = {
  name?: string;
  code?: string | null;
  role?: string;
};

export interface UserParams {
  role?: string;
  name?: string;
  code?: string;
  limit?: number;
  page?: number;
}

export interface UserListResponse {
  status: number;
  success: boolean;
  message: string;
  meta: Meta;
  data: User[];
}
