import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { catchError, map, Observable } from 'rxjs';
import {
  AuthenticateUserResponse,
  USERS_SERVICE_NAME,
  UsersClient,
} from '../generated/users';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  private usersClient: UsersClient;

  constructor(@Inject('koschei') private client: ClientGrpc) {}

  onModuleInit() {
    this.usersClient = this.client.getService<UsersClient>(USERS_SERVICE_NAME);
  }

  canActivate(context: ExecutionContext): Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    return this.usersClient.authenticateUser({ token }).pipe(
      map((payload: AuthenticateUserResponse) => {
        // Присваиваем payload объекту запроса для использования в обработчиках маршрутов
        request['userName'] = payload.name;
        return true;
      }),
      catchError(() => {
        throw new UnauthorizedException();
      }),
    );
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request?.cookies?.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
