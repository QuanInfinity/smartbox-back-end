import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Rent } from '../../rents/entities/rent.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  payment_id: number;

  @Column()
  rent_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: ['card', 'momo', 'zalopay', 'payos'] })
  method: string;

  @Column({ type: 'enum', enum: ['paid', 'pending', 'failed'], default: 'pending' })
  status: string;

  @Column({ length: 100, nullable: true })
  transaction_id: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  payment_time: Date;

  @ManyToOne(() => Rent, rent => rent.rent_id)
  @JoinColumn({ name: 'rent_id' })
  rent: Rent;
}
