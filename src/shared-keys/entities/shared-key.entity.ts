import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Rent } from '../../rents/entities/rent.entity';
import { User } from '../../user/entities/user.entity';

@Entity('shared_keys')
export class SharedKey {
  @PrimaryGeneratedColumn()
  shared_id: number;

  @Column()
  rent_id: number;

  @Column()
  sender_id: number;

  @Column({ length: 20 })
  receiver_phone: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  shared_at: Date;

  @Column({ type: 'datetime', nullable: true })
  expires_at: Date;

  @Column({ type: 'datetime', nullable: true })
  used_at: Date;

  @ManyToOne(() => Rent, rent => rent.rent_id)
  @JoinColumn({ name: 'rent_id' })
  rent: Rent;

  @ManyToOne(() => User, user => user.user_id)
  @JoinColumn({ name: 'sender_id' })
  sender: User;
}