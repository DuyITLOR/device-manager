import type { User } from './user';

export type SigninDto = {
  email: string;
  password: string;
};

export type SigninResponse = {
  status: number;
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: User;
  };
};

export type SignupDto = {
  email: string;
  password: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MANAGER';
};

export type SignupResponse = {
  status: number;
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};