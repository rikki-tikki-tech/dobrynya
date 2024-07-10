import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as path from 'node:path';

const COMMON_PROTO_PATH = path.resolve(
  __dirname,
  '../../../node_modules/google-proto-files/',
);
const PROTO_PATH = path.resolve(__dirname, '../../../proto/users.proto');
console.log(PROTO_PATH, 43434);

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'koschei',
        transport: Transport.GRPC,
        options: {
          package: 'koschei.ports.grpc.proto.v1',
          protoPath: PROTO_PATH,
          url: '158.160.25.210:50051',
          loader: {
            includeDirs: [COMMON_PROTO_PATH],
          },
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [],
})
export class UsersModule {}
