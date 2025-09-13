import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { Rent } from '../rents/entities/rent.entity';
import { Compartment } from '../locker/entities/compartment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rent, Compartment])],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
