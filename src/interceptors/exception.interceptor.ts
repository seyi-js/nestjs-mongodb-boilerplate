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

export interface IAPIErrorDetail {
  field?: string;
  message: string;
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

    let errorMessage = 'An unexpected error occurred.';

    let errors: IAPIErrorDetail[] = [];

    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'object') {
        const responseObj = response as any;

        // Handle validation errors
        if (responseObj.message && Array.isArray(responseObj.message)) {
          errors = this.formatValidationErrors(responseObj.message);
        } else {
          errorMessage = responseObj.message || errorMessage;
          errors = this.formatErrors(responseObj);
        }
      } else {
        errorMessage = response as string;
        errors = [{ message: errorMessage }];
      }
    }

    const responseBody = {
      statusCode: httpStatus,
      message:
        exception && exception.getResponse
          ? exception.getResponse()['message']
          : exception.message ||
            'oops! something occurred, your request cannot be processed at the moment.', //errorMessage,
      errors: errors,
      error: this.getErrorType(httpStatus),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);

    if (httpStatus >= 500) {
      captureException(exception);
      this.logger.error(exception, (exception as Error)?.stack, {
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
        ...responseBody,
      });
    }
  }

  private formatValidationErrors(validationErrors: any[]): IAPIErrorDetail[] {
    if (!Array.isArray(validationErrors)) {
      return [{ message: validationErrors }];
    }

    return validationErrors.map((error) => {
      // If it's already in the correct format
      if (error.field && error.message) {
        return error;
      }

      // If it's a simple string
      if (typeof error === 'string') {
        const match = error.match(/^([^:]+?)(?:\smust|should)/);
        return {
          field: match ? match[1] : undefined,
          message: error,
        };
      }

      // If it's a validation error object
      if (error.property && error.constraints) {
        const messages = Object.values(error.constraints);
        return {
          field: error.property,
          message: messages[0],
        };
      }

      // Fallback
      return {
        message: error.message || error.toString(),
      };
    });
  }

  private formatErrors(error: any): IAPIErrorDetail[] {
    if (!error) return [];

    if (Array.isArray(error)) {
      return error.map((err) => ({
        field: err.field,
        message: err.message,
      }));
    }

    if (error.errors && Array.isArray(error.errors)) {
      return error.errors;
    }

    return [{ message: error.message || 'An error occurred' }];
  }

  private getErrorType(status: number): string {
    switch (status) {
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 422:
        return 'Unprocessable Entity';
      case 500:
        return 'Internal Server Error';
      default:
        return 'Error';
    }
  }
}
