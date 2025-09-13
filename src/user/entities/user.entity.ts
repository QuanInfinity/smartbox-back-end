import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { IsNotEmpty, IsEmail, IsOptional, Length, IsPhoneNumber, IsInt, Min } from "class-validator";

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 20, unique: true })
    phone_number: string;

    @Column({ length: 100, nullable: false, unique: true })
    email?: string;

    @Column({ length: 255 })
    password: string;

    @Column()
    role_id: number;

    @Column({ default: 1 })
    status?: number;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    wallet?: number;
}

