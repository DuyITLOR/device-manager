import { SetMetadata } from '@nestjs/common';

// Setup roles before controller by @Role('ADMIN', 'USER')
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
