import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorMessage: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      const errorResponse = exception.getResponse();
      errorMessage =
        typeof errorResponse === 'object' && 'message' in errorResponse
          ? errorResponse.message
          : exception.message;
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
    }

    const responseBody = {
      statusCode: status,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${JSON.stringify(errorMessage)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(responseBody);
  }
}
