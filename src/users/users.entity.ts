import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Event } from '../events/events.entity';

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

    @Column({ default: false })
    isAdmin: boolean;

    @OneToOne(() => Event, (event) => event.user) // specify inverse side as a second parameter
    event: Event;
}
