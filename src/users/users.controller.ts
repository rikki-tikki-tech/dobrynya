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
import { map, Observable, switchMap, tap } from 'rxjs';
import {
  GetUserRequest,
  GoogleSignInOrSignUpUserRequest,
  SignInUserRequest,
  SignInUserResponse,
  SignUpUserRequest,
  UpdateUserRequest,
  User,
  USERS_SERVICE_NAME,
  UsersClient,
} from '@/generated/users';
import { ClientGrpc } from '@nestjs/microservices';
import { AuthGuard } from '@/auth/auth.guard';

@Controller('users')
export class UsersController implements OnModuleInit {
  private usersClient: UsersClient;

  constructor(@Inject('koschei') private client: ClientGrpc) {}

  onModuleInit() {
    this.usersClient = this.client.getService<UsersClient>(USERS_SERVICE_NAME);
  }

  private handleSignInResponse(
    res: Response,
    response: {
      token: string;
    },
  ): void {
    const token = response.token; // Предполагается, что токен находится в ответе

    const maxAge = 6 * 30 * 24 * 60 * 60 * 1000; // 6 месяцев
    res.cookie('authorization', `Bearer ${token}`, {
      httpOnly: true,
      secure: true,
      domain: '.yenisei.org',
      maxAge,
    });

    res.send('Successfully logged in');
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() request: Request): Observable<User> {
    // eslint-disable-next-line
    return this.usersClient.getUser({ id: (request as any).userId });
  }

  @Post('google')
  googleSignInOrSignUpUser(
    @Res() res: Response,
    @Body() request: GoogleSignInOrSignUpUserRequest,
  ): Observable<void> {
    return this.usersClient.googleSignInOrSignUpUser(request).pipe(
      tap((response: SignInUserResponse) =>
        this.handleSignInResponse(res, response),
      ),
      map(() => undefined),
    );
  }

  @Post()
  createUser(
    @Res() res: Response,
    @Body() request: SignUpUserRequest,
  ): Observable<void> {
    return this.usersClient.signUpUser(request).pipe(
      switchMap((user: User) => {
        const signInRequest: SignInUserRequest = {
          email: user.email,
          password: request.user.password,
        };
        return this.usersClient.signInUser(signInRequest);
      }),
      tap((response: SignInUserResponse) =>
        this.handleSignInResponse(res, response),
      ),
      map(() => undefined),
    );
  }

  @Post('signin')
  signInUser(
    @Res() res: Response,
    @Body() request: SignInUserRequest,
  ): Observable<void> {
    return this.usersClient.signInUser(request).pipe(
      tap((response: SignInUserResponse) =>
        this.handleSignInResponse(res, response),
      ),
      map(() => undefined),
    );
  }

  @Post('signout')
  @UseGuards(AuthGuard)
  logout(@Res() res: Response): void {
    res.clearCookie('authorization', {
      httpOnly: true,
      secure: true,
      domain: '.yenisei.org',
    });

    res.send({ message: 'Successfully logged out' });
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  getUser(@Param() request: GetUserRequest): Observable<User> {
    return this.usersClient.getUser({ id: request.id });
  }

  @Put()
  @UseGuards(AuthGuard)
  updateUser(@Body() request: UpdateUserRequest): Observable<User> {
    return this.usersClient.updateUser(request);
  }
}
