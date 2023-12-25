import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    email: string;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    code: string;

    @Column({ nullable: true })
    refreshToken: string;

    @Column({ nullable: true })
    accessToken: string;

    @Column({ nullable: true })
    deviceId: string;
}
