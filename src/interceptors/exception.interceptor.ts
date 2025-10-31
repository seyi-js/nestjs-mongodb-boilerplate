import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { captureException } from '@sentry/node';
import { IStructuredResponse } from './response.interceptor';

export interface IAPIErrorDetail {
  message: string;
  field?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger: Logger = new Logger('error');
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception && exception.getResponse
        ? exception.getResponse()['message']
        : 'oops! something occurred, your request cannot be processed at the moment.';

    const res = message && typeof message !== 'string' ? message[0] : message;

    const httpMessage =
      httpStatus < 500
        ? res
        : 'oops! something occurred, your request cannot be processed at the moment.';

    const path = httpAdapter.getRequestUrl(ctx.getRequest());

    const responseBody: IStructuredResponse = {
      statusCode: httpStatus,
      message: httpMessage,
      success: httpStatus < 400,
      errors: this.formatErrors(message),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);

    responseBody['path'] = path;

    if (httpStatus >= 500) {
      captureException(exception);

      this.logger.error(
        exception,
        exception && exception.stack ? exception.stack : null,
        responseBody,
      );
    }
  }

  formatErrors(error: any): IAPIErrorDetail[] {
    let formattedErrors: IAPIErrorDetail[] = [];

    if (
      error &&
      typeof error === 'object' &&
      'isJoi' in error &&
      error.details
    ) {
      formattedErrors = error.details.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message.replace(/['"]/g, ''),
      }));
    } else if (Array.isArray(error)) {
      formattedErrors = error;
    } else if (typeof error === 'string') {
      formattedErrors = [{ message: error }];
    }

    return formattedErrors;
  }
}
