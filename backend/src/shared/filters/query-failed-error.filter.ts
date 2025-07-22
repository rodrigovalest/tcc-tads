import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

const constraintMessages: Record<string, string> = {
  'UQ_78a916df40e02a9deb1c4b75edb': 'Username already exists.',
  'UQ_email_constraint': 'Email already registered.',
};

@Catch(QueryFailedError)
export class QueryFailedErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(QueryFailedErrorFilter.name, { timestamp: true });

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const driverError = (exception as any).driverError || {};
    const code = driverError.code;
    const constraint = driverError.constraint;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Unexpected database error';

    if (code === '23505') {
      status = HttpStatus.CONFLICT;
      message = constraintMessages[constraint] ?? 'Resource already exists.';
    }

    this.logger.error(
      `HTTP ${status} | ${request.method} ${request.url} | Exception name: ${exception.name} | Message: ${message} | ${exception.message} | Driver error: ${JSON.stringify(driverError)}`
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
