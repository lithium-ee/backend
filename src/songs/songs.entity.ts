import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    UpdateDateColumn,
} from 'typeorm';
import { EndUser } from '../end-user/end-user.entity';

@Entity('songs')
export class Song {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    eventId: string;

    @Column()
    spotifyId: string;

    @Column()
    title: string;

    @Column()
    artists: string;

    @Column()
    pushedToSpotify: boolean;

    @UpdateDateColumn()
    timestamp: Date;

    @ManyToOne(() => EndUser, (endUser) => endUser.songs)
    endUser: EndUser;
}
