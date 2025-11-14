export type User = {
  id: string;
  code?: string;
  email: string;
  name: string;
  role: string;
  createdAt?: Date;
};

export type UpdateUserDto = {
  name?: string;
  code?: string;
  role?: string;
};
