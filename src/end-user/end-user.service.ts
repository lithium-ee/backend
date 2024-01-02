import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EndUser } from './end-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EventsService } from '../events/events.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UsersService } from '../users/users.service';
import { SongsService } from '../songs/songs.service';
import { SubmitSongDto } from './interfaces/submit-song.interface';

@Injectable()
export class EndUserService {
    constructor(
        @InjectRepository(EndUser)
        private readonly endUserRepository: Repository<EndUser>,
        private readonly eventsService: EventsService,
        private readonly usersService: UsersService,
        private readonly songsService: SongsService,
        private httpService: HttpService,
    ) {}
    public async createNewEndUserForEvent(
        eventId: string,
    ): Promise<{ endUserId: string }> {
        const newEndUser = await this.endUserRepository.create({
            event: { id: eventId },
        });
        const res = await this.endUserRepository.save(newEndUser);
        return {
            endUserId: res.id,
        };
    }

    public async verifyEndUserForEvent(verifyUserDto: {
        eventId: string;
        userId: string;
    }): Promise<boolean> {
        const endUser = await this.endUserRepository.findOne({
            where: {
                id: verifyUserDto.userId,
                event: { id: verifyUserDto.eventId },
            },
        });
        if (!endUser) {
            return false;
        }
        return true;
    }

    public async getCooldown(
        eventId: string,
        userId: string,
    ): Promise<{ cooldown: number }> {
        const endUser = await this.endUserRepository.findOne({
            where: {
                id: userId,
                event: { id: eventId },
            },
            relations: ['event'],
        });

        if (!endUser) {
            throw new HttpException(
                'Something went wrong, please rescan QR code',
                HttpStatus.BAD_REQUEST,
            );
        }

        // calculate the remaining cooldown using enduser.cooldownStart and enduser.cooldownEnd

        const cooldown = endUser.cooldownEnd
            ? endUser.cooldownEnd.getTime() - new Date().getTime()
            : 0;

        return {
            cooldown: cooldown,
        };
    }

    public async searchSong(
        eventId: string,
        query: string,
        retry = true,
    ): Promise<any> {
        // get the events auth token
        const user = await this.eventsService.getUserByEventID(eventId);
        try {
            console.log(query);
            const response = await lastValueFrom(
                this.httpService.get('https://api.spotify.com/v1/search', {
                    params: {
                        q: query,
                        type: 'track',
                    },
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }),
            );

            // log out the first tracks image url

            return response.data.tracks.items.map((item: any) => ({
                id: item.id,
                name: item.name,
                artists:
                    item.artists.length > 1
                        ? `${item.artists
                              .slice(0, -1)
                              .map((artist: any) => artist.name)
                              .join(', ')} and ${
                              item.artists[item.artists.length - 1].name
                          }`
                        : item.artists[0].name,
                image: item.album.images[0].url,
            }));
        } catch (error) {
            if (error.response && error.response.status === 401 && retry) {
                await this.usersService.refreshAccessToken(user);
                return await this.searchSong(eventId, query, false);
            } else {
                // Some other error occurred
                console.log(error);
                throw new HttpException(
                    'An error occurred while fetching active devices',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async submitSong(
        submitSongDto: SubmitSongDto,
    ): Promise<boolean | { cooldown: number }> {
        const endUser = await this.endUserRepository.findOne({
            where: {
                id: submitSongDto.userId,
            },
            relations: ['event'],
        });

        if (!endUser) {
            return false;
        }
        const coolDown = await this.getCooldown(
            submitSongDto.eventId,
            submitSongDto.userId,
        );
        console.log(coolDown);

        if (coolDown.cooldown > 0) {
            return coolDown;
        }

        const res = await this.songsService.addSong(
            submitSongDto.song,
            submitSongDto.eventId,
            endUser,
        );

        // get the event cooldown

        const eventCooldown = await this.eventsService.getCooldown(
            submitSongDto.eventId,
        );

        if (res) {
            if (eventCooldown) {
                endUser.cooldownStart = new Date();
                endUser.cooldownEnd = new Date(
                    endUser.cooldownStart.getTime() + eventCooldown,
                );
                await this.endUserRepository.save(endUser);
            }
            return true;
        } else {
            return false;
        }
    }

    public async suspendEndUser(songId: string) {
        const song = await this.songsService.getSong(songId);
        const endUser = await this.endUserRepository.findOne({
            where: {
                id: song.endUser.id,
            },
        });

        console.log(endUser);
        endUser.cooldownStart = new Date();
        endUser.cooldownEnd = new Date(
            endUser.cooldownStart.getTime() + 1000 * 60 * 60 * 24,
        );
        await this.endUserRepository.save(endUser);

        this.songsService.rejectRequest(songId);
        return true;
    }
}
