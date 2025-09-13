import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Compartment } from '../../locker/entities/compartment.entity';

@Entity('rents')
export class Rent {
  @PrimaryGeneratedColumn()
  rent_id: number;

  @Column()
  user_id: number;

  @Column()
  compartment_id: number;

  @Column({ type: 'datetime' })
  start_time: Date;

  @Column({ type: 'datetime', nullable: true })
  end_time: Date | null;

  @Column({ type: 'datetime', nullable: true })
  pickup_time: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_per_hour: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_cost: number | null;

  @Column({ type: 'int', default: 1 })
  status: number; // 1: active, 0: completed, 2: canceled

  @Column({ type: 'varchar', length: 50, nullable: true })
  rental_type: string; // 'short_term', 'long_term', 'delivery'

  @Column({ type: 'varchar', length: 15, nullable: true })
  receiver_phone: string; // For delivery rentals

  @ManyToOne(() => User, user => user.user_id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Compartment, compartment => compartment.compartment_id)
  @JoinColumn({ name: 'compartment_id' })
  compartment: Compartment;
}
