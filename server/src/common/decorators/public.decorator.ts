import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);
// Use @Public() before controller