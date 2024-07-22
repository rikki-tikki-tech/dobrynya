import { catchError } from 'rxjs/operators';
import { status as Status } from '@grpc/grpc-js';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';

export const HTTP_CODE_FROM_GRPC: Record<number, number> = {
  [Status.OK]: HttpStatus.OK,
  [Status.CANCELLED]: HttpStatus.METHOD_NOT_ALLOWED,
  [Status.UNKNOWN]: HttpStatus.BAD_GATEWAY,
  [Status.INVALID_ARGUMENT]: HttpStatus.UNPROCESSABLE_ENTITY,
  [Status.DEADLINE_EXCEEDED]: HttpStatus.REQUEST_TIMEOUT,
  [Status.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [Status.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [Status.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
  [Status.RESOURCE_EXHAUSTED]: HttpStatus.TOO_MANY_REQUESTS,
  [Status.FAILED_PRECONDITION]: HttpStatus.PRECONDITION_REQUIRED,
  [Status.ABORTED]: HttpStatus.METHOD_NOT_ALLOWED,
  [Status.OUT_OF_RANGE]: HttpStatus.PAYLOAD_TOO_LARGE,
  [Status.UNIMPLEMENTED]: HttpStatus.NOT_IMPLEMENTED,
  [Status.INTERNAL]: HttpStatus.INTERNAL_SERVER_ERROR,
  [Status.UNAVAILABLE]: HttpStatus.NOT_FOUND,
  [Status.DATA_LOSS]: HttpStatus.INTERNAL_SERVER_ERROR,
  [Status.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
};

@Injectable()
export class GrpcToHttpErrorsInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    return next.handle().pipe(
      catchError((err) => {
        if (
          !(
            typeof err === 'object' &&
            'details' in err &&
            err.details &&
            typeof err.details === 'string'
          )
        )
          return throwError(() => err);

        const statusCode =
          HTTP_CODE_FROM_GRPC[err.code] || HttpStatus.INTERNAL_SERVER_ERROR;

        return throwError(
          () =>
            new HttpException(
              {
                message: err.details,
                statusCode,
                error: HttpStatus[statusCode],
              },
              statusCode,
              {
                cause: err,
              },
            ),
        );
      }),
    );
  }
}
