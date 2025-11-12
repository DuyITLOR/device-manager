import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    console.error('[HTTP ERROR]', exception);

    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let code = 'UNKNOWN_ERROR';

    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const resObj = response as Record<string, any>;
        message =
          typeof resObj.message === 'string'
            ? resObj.message
            : JSON.stringify(resObj.message);
        if ('code' in resObj && typeof resObj.code === 'string') {
          code = resObj.code;
        }
      }
    }

    res.status(status).json({
      status,
      success: false,
      code,
      message,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
