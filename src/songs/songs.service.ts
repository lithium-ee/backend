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
                eventId: eventId,
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
                    eventId: eventId,
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
                    `https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%3A${songId}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${user.accessToken}`,
                        },
                    },
                ),
            );
            console.log(res);
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

    public async getLogsAndRequests(userId: string) {
        const eventId = await this.usersService.getEventIdByUserId(userId);

        const songs = await this.songRepository.find({
            where: { eventId: eventId },
            order: { timestamp: 'DESC' },
        });

        // we need to return an object { logs: [], requests: [] }
        const logs = songs.filter((song) => song.pushedToSpotify);
        const requests = songs.filter((song) => !song.pushedToSpotify);

        return { logs, requests };
    }

    public async acceptRequest(userId: string, songId: string) {
        // get the song from the db
        const song = await this.songRepository.findOne({
            where: { id: songId },
        });
        // verify that song exists and hasnt been added to spotify
        if (!song || song.pushedToSpotify) {
            return false;
        }

        if (await this.addToQueue(song.spotifyId, song.eventId)) {
            // update the song in the db
            song.pushedToSpotify = true;
            this.songRepository.save(song);
            return true;
        } else {
            // error
            return false;
        }
    }

    public async rejectRequest(songId: string) {
        // get the song from the db
        const song = await this.songRepository.findOne({
            where: { id: songId },
        });
        // verify that song exists and hasnt been added to spotify
        if (!song || song.pushedToSpotify) {
            return false;
        }

        // delete the song from the db
        this.songRepository.delete(songId);
        return true;
    }

    public async getSong(songId: string) {
        return await this.songRepository.findOne({
            where: { id: songId },
            relations: ['endUser'],
        });
    }
}
