import { Injectable } from '@nestjs/common';
import { EndUser } from '../end-user/end-user.entity';
import { SongDto } from '../end-user/interfaces/submit-song.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Song } from './songs.entity';
import { HttpService } from '@nestjs/axios';
import { EventsService } from '../events/events.service';
import { lastValueFrom } from 'rxjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class SongsService {
    constructor(
        @InjectRepository(Song)
        private readonly songRepository: Repository<Song>,
        private httpService: HttpService,
        private eventsService: EventsService,
        private usersService: UsersService,
    ) {}
    async addSong(songDto: SongDto, eventId: string, endUser: EndUser) {
        if (endUser.event.filterSongs) {
            // add entry to db
            this.songRepository.save({
                title: songDto.name,
                artists: songDto.artists,
                spotifyId: songDto.id,
                endUser: endUser,
                pushedToSpotify: false,
            });
            return true;
        } else {
            // add to spotify
            if (await this.addToQueue(songDto.id, eventId)) {
                this.songRepository.save({
                    title: songDto.name,
                    artists: songDto.artists,
                    spotifyId: songDto.id,
                    endUser: endUser,
                    pushedToSpotify: true,
                });

                return true;
            } else {
                return false;
            }
        }
    }

    private async addToQueue(songId: string, eventId: string, retry = true) {
        const user = await this.eventsService.getUserByEventID(eventId);

        try {
            const res = await lastValueFrom(
                this.httpService.post(
                    `https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%3A${songId}?device_id=${user.deviceId}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${user.accessToken}`,
                        },
                    },
                ),
            );

            return true;
        } catch (error) {
            if (error.response && error.response.status === 401 && retry) {
                await this.usersService.refreshAccessToken(user);
                return await this.addToQueue(songId, eventId, false);
            } else {
                console.log(error);
                return false;
            }
        }
    }
}
