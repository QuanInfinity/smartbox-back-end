import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './user/entities/user.entity';
import { LockerModule } from './locker/locker.module';
import { Size } from './locker/entities/size.entity';
import { Location } from './locker/entities/location.entity';
import { Locker } from './locker/entities/locker.entity';
import { Compartment } from './locker/entities/compartment.entity';
import { AddressModule } from './address/address.module';
import { AuthModule } from './auth/auth.module';
import { Province } from './address/entities/province.entity';
import { District } from './address/entities/district.entity';
import { Ward } from './address/entities/ward.entity';
import { RentsModule } from './rents/rents.module';
import { PaymentsModule } from './payments/payments.module';
import { SharedKeysModule } from './shared-keys/shared-keys.module';
import { TasksModule } from './tasks/tasks.module';
import { Rent } from './rents/entities/rent.entity';
import { Payment } from './payments/entities/payment.entity';
import { SharedKey } from './shared-keys/entities/shared-key.entity';
require('dotenv').config();

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT!, 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [
        User,
        Size,
        Location,
        Locker,
        Compartment,
        Province,
        District,
        Ward,
        Rent,
        Payment,
        SharedKey
      ],
      synchronize: false,
    }),
    UserModule,
    LockerModule,
    AddressModule,
    AuthModule,
    RentsModule,
    PaymentsModule,
    SharedKeysModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
