import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    OneToMany,
} from 'typeorm';
import { Event } from '../events/events.entity';
import { Song } from '../songs/songs.entity';

@Entity('end-users')
export class EndUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Event, (event) => event.endUsers)
    event: Event;

    @Column({ nullable: true })
    cooldownStart: Date;

    @Column({ nullable: true })
    cooldownEnd: Date;

    @OneToMany(() => Song, (song) => song.endUser)
    songs: Song[];
}
