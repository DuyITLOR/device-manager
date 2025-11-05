import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      console.error('[HTTP ERROR]', exception);

      const ctx = host.switchToHttp();
      const res = ctx.getResponse();
      const req = ctx.getRequest();
  
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
  
      const response =
        exception instanceof HttpException
          ? (exception.getResponse() as any)
          : { message: 'Internal server error' };
  
      const message =
        typeof response === 'string' ? response : response.message || 'Error';
      const code =
        typeof response === 'object' && response.code ? response.code : 'UNKNOWN_ERROR';
  
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
  