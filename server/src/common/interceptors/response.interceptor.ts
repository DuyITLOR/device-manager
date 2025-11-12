import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Response } from 'express';

interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, any>;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data): ApiResponse<T> => {
        let message = 'Success';
        let responseData: T = data;
        let meta: Record<string, any> | undefined = undefined;

        if (typeof data === 'object' && data !== null) {
          if (
            'message' in data &&
            typeof (data as { message?: unknown }).message === 'string'
          ) {
            message = (data as { message: string }).message;
          }

          if ('data' in data) {
            responseData = (data as { data: T }).data;
          }

          if ('meta' in data) {
            meta = (data as { meta?: Record<string, any> }).meta;
          }
        }

        return {
          status: res.statusCode ?? 200,
          success: true,
          message,
          ...(meta ? { meta } : {}),
          data: responseData,
        };
      }),
    );
  }
}
