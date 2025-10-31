import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponse } from '../shared/interfaces';

export interface IStructuredResponse extends IResponse {
  statusCode: number;
  success: boolean;
  errors?: any;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, IStructuredResponse>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IStructuredResponse> {
    return next.handle().pipe(
      map(({ data = undefined, message, meta, errors }) => {
        const res = context.switchToHttp().getResponse();

        return {
          statusCode: res.statusCode,
          success: true,
          message,
          data,
          meta,
          errors,
        };
      }),
    );
  }
}
