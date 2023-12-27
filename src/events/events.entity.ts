import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { User } from '../users/users.entity';
@Entity('events')
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'json' })
    device: { id: string; name: string };

    @Column()
    cooldown: number;

    @Column()
    filterSongs: boolean;

    @OneToOne(() => User, (user) => user.event) // specify inverse side as a second parameter
    @JoinColumn()
    user: User;
}
