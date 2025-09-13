import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentsService } from './rents.service';
import { RentsController } from './rents.controller';
import { Rent } from './entities/rent.entity';
import { Compartment } from '../locker/entities/compartment.entity';
import { SharedKeysModule } from '../shared-keys/shared-keys.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rent, Compartment]),
    SharedKeysModule,
    UserModule
  ],
  controllers: [RentsController],
  providers: [RentsService],
  exports: [RentsService],
})
export class RentsModule {}
