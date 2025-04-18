import { Global, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as path from 'node:path';

const COMMON_PROTO_PATH = path.resolve(
  __dirname,
  '../../node_modules/google-proto-files/',
);
const PROTO_PATH = path.resolve(__dirname, '../../proto/users.proto');

@Global()
@Module({
  imports: [
    HealthModule,
    UsersModule,
    ClientsModule.register([
      {
        name: 'koschei',
        transport: Transport.GRPC,
        options: {
          package: 'koschei.ports.grpc.proto.v1',
          protoPath: PROTO_PATH,
          url: '89.169.148.201:50051',
          loader: {
            includeDirs: [COMMON_PROTO_PATH],
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class AppModule {}
