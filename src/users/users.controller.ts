import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { map, Observable, tap } from 'rxjs';
import {
  GetUserRequest,
  SignInUserRequest,
  SignInUserResponse,
  SignUpUserRequest,
  UpdateUserRequest,
  User,
  USERS_SERVICE_NAME,
  UsersClient,
} from '../generated/users';
import { ClientGrpc } from '@nestjs/microservices';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UsersController implements OnModuleInit {
  private usersClient: UsersClient;

  constructor(@Inject('koschei') private client: ClientGrpc) {}

  onModuleInit() {
    this.usersClient = this.client.getService<UsersClient>(USERS_SERVICE_NAME);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() request: Request): Observable<User> {
    // eslint-disable-next-line
    return this.usersClient.getUser({ name: (request as any).userName });
  }

  @Get(':name')
  @UseGuards(AuthGuard)
  getUser(@Param() request: GetUserRequest): Observable<User> {
    return this.usersClient.getUser({ name: request.name });
  }

  @Put(':name')
  @UseGuards(AuthGuard)
  updateUser(@Body() request: UpdateUserRequest): Observable<User> {
    return this.usersClient.updateUser(request);
  }

  @Post()
  createUser(@Body() request: SignUpUserRequest): Observable<User> {
    return this.usersClient.signUpUser(request);
  }

  @Post('signin')
  signInUser(
    @Res() res: Response,
    @Body() request: SignInUserRequest,
  ): Observable<void> {
    return this.usersClient.signInUser(request).pipe(
      tap((response: SignInUserResponse) => {
        const token = response.token; // Предполагается, что токен находится в ответе

        const maxAge = 6 * 30 * 24 * 60 * 60 * 1000; // 6 месяцев
        res.cookie('authorization', `Bearer ${token}`, {
          httpOnly: true,
          maxAge,
        });

        res.send('Successfully logged in');
      }),
      map(() => undefined),
    );
  }
}
