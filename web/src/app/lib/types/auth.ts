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
