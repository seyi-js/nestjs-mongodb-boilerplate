import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponse } from '../shared/interfaces';

export interface Response extends IResponse {
  statusCode: number;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, Response>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response> {
    return next.handle().pipe(
      map(({ data = undefined, message }) => {
        const res = context.switchToHttp().getResponse();

        return {
          statusCode: res.statusCode,
          message,
          data,
        };
      }),
    );
  }
}
