import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedKey } from './entities/shared-key.entity';
import { Rent } from '../rents/entities/rent.entity';
import { SharedKeysService } from './shared-keys.service';
import { SharedKeysController } from './shared-keys.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SharedKey, Rent]),
    UserModule
  ],
  controllers: [SharedKeysController],
  providers: [SharedKeysService],
  exports: [SharedKeysService],
})
export class SharedKeysModule {}
