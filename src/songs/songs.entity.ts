import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { EndUser } from '../end-user/end-user.entity';

@Entity('songs')
export class Song {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    spotifyId: string;

    @Column()
    title: string;

    @Column()
    artists: string;

    @Column()
    pushedToSpotify: boolean;

    @ManyToOne(() => EndUser, (endUser) => endUser.songs)
    endUser: EndUser;
}
