import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Rent } from '../rents/entities/rent.entity';
import { Compartment } from '../locker/entities/compartment.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Rent)
    private rentRepository: Repository<Rent>,
    @InjectRepository(Compartment)
    private compartmentRepository: Repository<Compartment>,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredRentals() {
    this.logger.log('Checking for expired rentals...');

    try {
      // Find all active rentals that have passed their end_time
      const expiredRentals = await this.rentRepository.find({
        where: {
          status: 1, // active
          end_time: LessThan(new Date()),
        },
        relations: ['compartment'],
      });

      if (expiredRentals.length === 0) {
        this.logger.log('No expired rentals found');
        return;
      }

      this.logger.log(`Found ${expiredRentals.length} expired rentals`);

      for (const rent of expiredRentals) {
        try {
          // Update rent status to completed
          rent.status = 0; // completed
          await this.rentRepository.save(rent);

          // Free up the compartment
          if (rent.compartment) {
            rent.compartment.status = 1; // available
            await this.compartmentRepository.save(rent.compartment);
          }

          this.logger.log(`Expired rental ${rent.rent_id} marked as completed and compartment ${rent.compartment_id} freed`);
        } catch (error) {
          this.logger.error(`Failed to process expired rental ${rent.rent_id}:`, error);
        }
      }

      this.logger.log(`Successfully processed ${expiredRentals.length} expired rentals`);
    } catch (error) {
      this.logger.error('Error checking expired rentals:', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredSharedKeys() {
    this.logger.log('Cleaning up expired shared keys...');
    
    try {
      // This could be implemented to clean up very old shared keys
      // For now, we'll just log that the cleanup ran
      this.logger.log('Shared keys cleanup completed');
    } catch (error) {
      this.logger.error('Error cleaning up shared keys:', error);
    }
  }
}
