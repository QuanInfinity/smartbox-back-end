import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LockerService } from './locker.service';
import { LockerController } from './locker.controller';
import { SizeService } from './size.service';
import { SizeController } from './size.controller';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { CompartmentService } from './compartment.service';
import { CompartmentController } from './compartment.controller';
import { Locker } from './entities/locker.entity';
import { Location } from './entities/location.entity';
import { Compartment } from './entities/compartment.entity';
import { Size } from './entities/size.entity';
import { SharedKey } from '../shared-keys/entities/shared-key.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Locker, Location, Compartment, Size, SharedKey]),
  ],
  controllers: [
    LockerController,
    SizeController,
    LocationController,
    CompartmentController,
  ],
  providers: [
    LockerService,
    SizeService,
    LocationService,
    CompartmentService,
  ],
  exports: [
    LockerService,
    SizeService,
    LocationService,
    CompartmentService,
  ],
})
export class LockerModule {}
