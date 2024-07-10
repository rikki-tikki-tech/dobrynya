import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  AuthenticateUserRequest,
  AuthenticateUserResponse,
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

@Controller('users')
export class UsersController implements OnModuleInit {
  private usersService: UsersClient;

  constructor(@Inject('koschei') private client: ClientGrpc) {}

  onModuleInit() {
    this.usersService = this.client.getService<UsersClient>(USERS_SERVICE_NAME);
  }

  @Get(':name')
  getUser(@Param() request: GetUserRequest): Observable<User> {
    return this.usersService.getUser({ name: request.name });
  }

  @Put(':name')
  updateUser(@Body() request: UpdateUserRequest): Observable<User> {
    return this.usersService.updateUser(request);
  }

  @Post()
  createUser(@Body() request: SignUpUserRequest): Observable<User> {
    return this.usersService.signUpUser(request);
  }

  @Post('signin')
  signInUser(
    @Body() request: SignInUserRequest,
  ): Observable<SignInUserResponse> {
    return this.usersService.signInUser(request);
  }

  @Post('authenticate')
  authenticateUser(
    @Body() request: AuthenticateUserRequest,
  ): Observable<AuthenticateUserResponse> {
    return this.usersService.authenticateUser(request);
  }
}
